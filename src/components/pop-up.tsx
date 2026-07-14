import type {HoverState} from '../types/types.ts'

import {useTranslation} from 'react-i18next'

import {groupColors} from '../data/skills.ts'

const pad = 18
const width = 260
const height = 140

export function Popup({ hover }: { hover: HoverState }) {
	const { t } = useTranslation()
	const { node, x, y } = hover
	const color = groupColors[node.group]
	const left = x + width + pad > window.innerWidth ? x - width - pad : x + pad
	const top = y + height + pad > window.innerHeight ? y - height - pad : y + pad

	return (
		<div
			className="fixed z-20 w-65 rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-md p-4 shadow-xl shadow-black/50 pointer-events-none"
			style={{ left, top }}
		>
			<p className="text-white font-semibold text-sm mb-1">{node.label}</p>
			<p className="text-xs font-medium mb-2" style={{ color }}>
				{t(`groups.${node.group}`)}
			</p>
			<p className="text-white/70 text-xs leading-relaxed mb-3">{node.desc}</p>
		</div>
	)
}
