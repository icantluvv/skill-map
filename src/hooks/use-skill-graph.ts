import type {RefObject} from 'react'
import type {HoverState, SkillLink, SkillNode} from '../types/types.ts'

import {type D3DragEvent, drag} from 'd3-drag'
import {forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY} from 'd3-force'
import {select} from 'd3-selection'
import {zoom} from 'd3-zoom'
import {useEffect} from 'react'
import {useTranslation} from 'react-i18next'

import {clusterAnchors, groupColors, links as rawLinks, nodes as rawNodes} from '../data/skills'

/**
 * Tailwind-классы для узлов/связей — пересчитываются целиком, чтобы избежать конфликтов утилит при
 * переключении состояний
 */
const nodeGroupClass = {
	base: 'cursor-grab active:cursor-grabbing opacity-100 transition-opacity duration-200',
	dim: 'cursor-grab active:cursor-grabbing opacity-20 transition-opacity duration-200',
	active: 'cursor-grab active:cursor-grabbing opacity-100 transition-opacity duration-200',
}

const linkClass = {
	base: 'stroke-white/20 stroke-1 transition-all duration-200',
	dim: 'stroke-white/10 stroke-1 opacity-40 transition-all duration-200',
	active: 'stroke-white/70 stroke-2 transition-all duration-200',
}

/** Строит и запускает D3-граф навыков внутри переданного <svg>; сам чистит DOM/симуляцию при размонтировании */
export function useSkillGraph(
	svgRef: RefObject<SVGSVGElement | null>,
	setHover: (hover: HoverState | null) => void,
) {
	const { t, i18n } = useTranslation()

	useEffect(() => {
		const svgEl = svgRef.current
		if (!svgEl) return

		// d3 мутирует объекты — работаем с копиями, чтобы эффект был идемпотентным при повторном монтировании (StrictMode).
		// Метки/описания подтягиваются из текущей локали, поэтому смена языка (i18n.language в deps) пересобирает граф заново.
		const nodes: SkillNode[] = rawNodes.map((n) => ({
			...n,
			label: t(`skills.${n.id}.label`),
			desc: t(`skills.${n.id}.desc`),
		}))
		const links: SkillLink[] = rawLinks.map((l) => ({ ...l }))

		const neighborMap = new Map<string, Set<string>>()
		nodes.forEach((n) => neighborMap.set(n.id, new Set([n.id])))
		links.forEach((l) => {
			const s = typeof l.source === 'string' ? l.source : (l.source as SkillNode).id
			const t = typeof l.target === 'string' ? l.target : (l.target as SkillNode).id
			neighborMap.get(s)?.add(t)
			neighborMap.get(t)?.add(s)
		})

		const svg = select(svgEl)
		svg.selectAll('*').remove() // чистим перед перерисовкой (важно при hot reload)

		// SVG-фильтры (feGaussianBlur) Safari растеризует заново на каждом кадре под transform —
		// при зуме/панораме с ~80 отфильтрованными узлами это даёт сильную просадку FPS. Вместо
		// blur-фильтра свечение рисуем radialGradient-заливкой — визуально то же самое, но дёшево
		// и одинаково быстро во всех браузерах.
		const defs = svg.append('defs')
		Object.entries(groupColors).forEach(([key, color]) => {
			const gradient = defs.append('radialGradient').attr('id', `glow-${key}`)
			gradient
				.append('stop')
				.attr('offset', '0%')
				.attr('stop-color', color)
				.attr('stop-opacity', 0.9)
			gradient
				.append('stop')
				.attr('offset', '100%')
				.attr('stop-color', color)
				.attr('stop-opacity', 0)
		})

		const container = svg.append('g')

		const linkSel = container
			.append('g')
			.selectAll<SVGLineElement, SkillLink>('line')
			.data(links)
			.join('line')
			.attr('class', linkClass.base)

		const nodeGroup = container
			.append('g')
			.selectAll<SVGGElement, SkillNode>('g')
			.data(nodes)
			.join('g')
			.attr('class', nodeGroupClass.base)

		nodeGroup
			.append('circle')
			.attr('r', 22)
			.attr('fill', (d) => `url(#glow-${d.group})`)

		nodeGroup
			.append('circle')
			.attr('class', 'stroke-white/25 stroke-1')
			.attr('r', 12)
			.attr('fill', (d) => groupColors[d.group])
			.attr('fill-opacity', 0.85)

		nodeGroup
			.append('text')
			.attr('class', 'fill-white text-[11px] font-medium select-none pointer-events-none')
			.attr('text-anchor', 'middle')
			.attr('dy', 26)
			.text((d) => d.label)

		// --- hover: подсветка соседей + сообщаем координаты в React state ---
		nodeGroup
			.on('mouseenter', (event: MouseEvent, d: SkillNode) => {
				const related = neighborMap.get(d.id)!
				nodeGroup.attr('class', (n) =>
					n.id === d.id
						? nodeGroupClass.active
						: related.has(n.id)
							? nodeGroupClass.base
							: nodeGroupClass.dim,
				)
				linkSel.attr('class', (l) => {
					const s = typeof l.source === 'string' ? l.source : (l.source as SkillNode).id
					const t = typeof l.target === 'string' ? l.target : (l.target as SkillNode).id
					if (s === d.id || t === d.id) return linkClass.active
					return related.has(s) && related.has(t) ? linkClass.base : linkClass.dim
				})
				setHover({ node: d, x: event.clientX, y: event.clientY })
			})
			.on('mouseleave', () => {
				nodeGroup.attr('class', nodeGroupClass.base)
				linkSel.attr('class', linkClass.base)
				setHover(null)
			})

		// --- drag ---
		const dragBehavior = drag<SVGGElement, SkillNode>()
			.on('start', (event: D3DragEvent<SVGGElement, SkillNode, SkillNode>, d) => {
				if (!event.active) sim.alphaTarget(0.25).restart()
				d.fx = d.x
				d.fy = d.y
			})
			.on('drag', (event: D3DragEvent<SVGGElement, SkillNode, SkillNode>, d) => {
				d.fx = event.x
				d.fy = event.y
			})
			.on('end', (event: D3DragEvent<SVGGElement, SkillNode, SkillNode>, d) => {
				if (!event.active) sim.alphaTarget(0)
				d.fx = null
				d.fy = null
			})
		nodeGroup.call(dragBehavior)

		// --- zoom / pan ---
		svg.call(
			zoom<SVGSVGElement, unknown>()
				.scaleExtent([0.5, 3])
				.on('zoom', (event) => container.attr('transform', event.transform.toString())),
		)

		// --- симуляция: forceX/forceY тянут каждую группу к своему центру ---
		// Размер читается из DOM только тут, а не на каждом тике/узле — clientWidth/clientHeight
		// вызывают forced reflow, и дергать их для каждого узла на каждом тике было слишком дорого.
		let size = { w: svgEl.clientWidth, h: svgEl.clientHeight }

		const forceXFn = forceX<SkillNode>((d) => size.w * clusterAnchors[d.group].fx).strength(
			0.06,
		)
		const forceYFn = forceY<SkillNode>((d) => size.h * clusterAnchors[d.group].fy).strength(
			0.06,
		)

		const sim = forceSimulation(nodes)
			.force(
				'link',
				forceLink<SkillNode, SkillLink>(links)
					.id((d) => d.id)
					.distance(90)
					.strength(0.6),
			)
			.force('charge', forceManyBody().strength(-260))
			.force('collide', forceCollide<SkillNode>().radius(28))
			.force('x', forceXFn)
			.force('y', forceYFn)
			.on('tick', () => {
				linkSel
					.attr('x1', (d) => (d.source as SkillNode).x!)
					.attr('y1', (d) => (d.source as SkillNode).y!)
					.attr('x2', (d) => (d.target as SkillNode).x!)
					.attr('y2', (d) => (d.target as SkillNode).y!)
				nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`)
			})

		const handleResize = () => {
			size = { w: svgEl.clientWidth, h: svgEl.clientHeight }
			// forceX/forceY считают целевые координаты один раз при инициализации, а не на каждом тике —
			// поэтому при ресайзе силы нужно переинициализировать явно, иначе якоря кластеров останутся старыми.
			sim.force('x', forceXFn).force('y', forceYFn).alpha(0.4).restart()
		}
		window.addEventListener('resize', handleResize)

		return () => {
			sim.stop()
			window.removeEventListener('resize', handleResize)
		}
	}, [svgRef, setHover, t, i18n.language])
}
