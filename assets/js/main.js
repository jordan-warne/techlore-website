// TODO: Individual files compilation!

// Theme Switcher
//! Thanks to https://dev.to/whitep4nth3r/the-best-lightdark-mode-theme-toggle-in-javascript-368f
function settingsThemeHandler({localStorageTheme, systemSettingDark}) {
	if (localStorageTheme !== null) {
		return localStorageTheme
	}

	if (systemSettingDark.matches) {
		return "dark"
	}

	return "light"
}

function updateButton({buttonEl, isDark}) {
	const newCta = isDark ? "Change to light theme" : "Change to dark theme"
	const themeStatus = isDark ? "js-dark-is-active" : "js-light-is-active"
	buttonEl.setAttribute("aria-label", newCta)
	buttonEl.setAttribute("data-active-theme", themeStatus)
}

function updateThemeOnHtmlEl({theme}) {
	document.querySelector("html").setAttribute("data-theme", theme)
}

const buttonSwitcher = document.querySelector("[data-theme-toggle]")
const localStorageTheme = localStorage.getItem("theme")
const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)")

let currentThemeSetting = settingsThemeHandler({localStorageTheme, systemSettingDark})

updateButton({buttonEl: buttonSwitcher, isDark: currentThemeSetting === "dark"})
updateThemeOnHtmlEl({theme: currentThemeSetting})

buttonSwitcher.addEventListener("click", (e) => {
	const newTheme = currentThemeSetting === "dark" ? "light" : "dark"

	localStorage.setItem("theme", newTheme)
	updateButton({buttonEl: buttonSwitcher, isDark: newTheme === "dark"})
	updateThemeOnHtmlEl({theme: newTheme})

	currentThemeSetting = newTheme
})


// Topic list generator
// Loosely inspired by the original script by Jonah Aragon <jonah@triplebit.net>

const getDiscussData = async (url) => {
	try {
		const response = await fetch(url);
		return await response.json();

	} catch (e) {
		console.warn(`Error: ${e}`);

	}
}

const discussTopicsConstructor = async () => {
	const lists = document.querySelectorAll('ul[data-forum]')

	if (!lists) return

	for (const ul of lists) {
		const dataset = ul.dataset
		const data = await getDiscussData(dataset.feed)
		const allTopics = data?.topic_list.topics
		const topicsLimiter = dataset?.count
		const users = data?.users
		let loopCount = 0

		if (allTopics && users) {
			// -- clear the "skeleton"
			ul.innerHTML = ''

			allTopics.forEach((topic) => {
				if (loopCount >= topicsLimiter) return

				// --- Data
				const title = topic.title
				const id = topic.id
				const url = dataset.forum + '/t/' + topic.slug + '/' + id
				const lastPosterUsername = topic.last_poster_username === 'system' ? 'Techlore' : topic.last_poster_username
				const views = topic.views
				let avatarUrl = 'assets/images/avatar-default.svg'

				users.forEach((user) => {
					if (user.username === topic.last_poster_username) {
						const avatar = user.avatar_template
						avatarUrl = dataset.forum + avatar.replace('{size}', '48')
					}
				})

				// -- Last posted date
				const lastPostedDate = new Date(topic.last_posted_at)
				const formattingOptions = {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					hour12: true
				}
				const lastPostedDateFormatted = lastPostedDate.toLocaleString('en-US', formattingOptions)

				const li = `<li class="topic-list__item">
					<a href="${url}" class="topic-list__link is-flex is-flex-direction-row is-gap-2 is-align-items-flex-start is-justify-content-flex-start">
						<img src="${avatarUrl}" alt="${lastPosterUsername}'s avatar" width="48" height="48" class="topic-list__avatar has-radius-rounded">

						<span class="topic-list__text is-flex is-flex-direction-column">
							<span class="topic-list__title">${title}</span>

							<span class="topic-list__footer mt-1 is-flex is-gap-3">
								<span class="topic-list__views px-2 is-inline-flex is-gap-1 is-align-items-center">${views}</span>
								<span class="topic-list__last-poster">
									${lastPostedDateFormatted} by ${lastPosterUsername}
								</span>
							</span>
						</span>
					</a>
				</li>`

				ul.innerHTML += li;
				loopCount++
			})
		}
	}
}

discussTopicsConstructor()
