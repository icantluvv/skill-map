import {useTranslation} from 'react-i18next'

const languages = [
	{ code: 'ru', label: 'RU' },
	{ code: 'en', label: 'EN' },
] as const

const links = [
	{
		key: 'project',
		href: 'https://github.com/icantluvv/skill-map',
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="h-5 w-5"
			>
				<path d="M9 18 4 13l5-5" />
				<path d="M15 8l5 5-5 5" />
			</svg>
		),
	},
	{
		key: 'github',
		href: 'https://github.com/icantluvv',
		icon: (
			<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
				<path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.67.8.56A10.53 10.53 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
			</svg>
		),
	},
	{
		key: 'telegram',
		href: 'https://t.me/vvhatineed',
		icon: (
			<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
				<path d="M21.94 3.42a1.2 1.2 0 0 0-1.24-.19L2.6 10.44a1.15 1.15 0 0 0 .1 2.16l4.55 1.47 1.76 5.65c.16.5.63.83 1.15.82.32-.01.62-.14.85-.37l2.55-2.55 4.5 3.33c.24.18.53.27.82.27.16 0 .33-.03.49-.09.47-.17.81-.58.9-1.08l3.14-15.44c.1-.48-.08-.98-.47-1.19ZM9.03 13.6l-2.9-.94 11.3-6.9-8.4 7.84Zm.98 4.8-.7-2.24 1.68-1.57 1.31 1Zm7.68.6-4.36-3.23 6.05-8.9-1.69 12.13Z" />
			</svg>
		),
	},
] as const

export function SidePanel() {
	const { t, i18n } = useTranslation()

	return (
		<div className="group absolute top-0 left-0 z-30">
			<button
				type="button"
				aria-label={t('sidePanel.menuLabel')}
				className="relative z-20 m-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 backdrop-blur-md shadow-lg shadow-black/40 transition-colors hover:bg-slate-800/80"
			>
				<span className="flex flex-col gap-1">
					<span className="h-0.5 w-5 rounded-full bg-white/80" />
					<span className="h-0.5 w-5 rounded-full bg-white/80" />
					<span className="h-0.5 w-5 rounded-full bg-white/80" />
				</span>
			</button>

			<aside className="absolute top-0 left-0 z-10 h-screen w-72 -translate-x-full border-r border-white/10 bg-slate-900/95 px-5 pt-20 pb-6 shadow-xl shadow-black/50 backdrop-blur-md transition-transform duration-300 ease-out group-hover:translate-x-0">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-sm font-semibold tracking-wide text-white/80 uppercase">
						{t('sidePanel.links')}
					</h2>

					<div className="flex items-center rounded-full border border-white/10 bg-slate-800/60 p-0.5 text-xs font-medium">
						{languages.map(({ code, label }) => (
							<button
								key={code}
								type="button"
								onClick={() => i18n.changeLanguage(code)}
								disabled={i18n.language === code}
								aria-pressed={i18n.language === code}
								className={`rounded-full px-2.5 py-1 transition-colors disabled:cursor-default ${
									i18n.language === code
										? 'bg-white/90 text-slate-900'
										: 'text-white/60 hover:text-white/90'
								}`}
							>
								{label}
							</button>
						))}
					</div>
				</div>

				<ul className="space-y-1.5">
					{links.map(({ key, href, icon }) => (
						<li key={key}>
							<a
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
							>
								{icon}
								{t(`sidePanel.${key}`)}
							</a>
						</li>
					))}
				</ul>
			</aside>
		</div>
	)
}
