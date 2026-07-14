import type {HoverState} from '../types/types.ts'

import {useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {useSkillGraph} from '../hooks/use-skill-graph.ts'
import {Popup} from './pop-up.tsx'
import {SidePanel} from './side-panel.tsx'

export default function SkillConstellation() {
	const { t } = useTranslation()
	const svgRef = useRef<SVGSVGElement>(null)
	const [hover, setHover] = useState<HoverState | null>(null)

	useSkillGraph(svgRef, setHover)

	return (
		<div className="relative w-full h-screen  bg-linear-to-b from-slate-950 via-slate-900 to-black text-white">
			<div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
				<h1 className="text-2xl font-semibold tracking-wide">{t('app.title')}</h1>
				<p className="text-sm text-white/60 mt-1">{t('app.subtitle')}</p>
			</div>

			<SidePanel />

			<svg ref={svgRef} className="absolute inset-0 z-10 w-full h-full" />

			{hover && <Popup hover={hover} />}
		</div>
	)
}
