console.info("Initializing...")

const WHITELISTED_WORDS_REGEX = /load|add|adapter/g
const BANNED_WORDS_REGEX = /ad|track|log|stats|midroll|videogoodput|consent|ServiceLogin|\/js\/bg\/|related_ajax|(guide\?key=)/  // Don't put a "g" flag at the end - it won't work!  // Dunno if "videogoodput" is evil but it doesn't seem to be necessary
const WHITELISTED_URLS = ["youtube.com/results?search_query=", "youtube.com/watch", "youtube.com/s/player/"]

chrome.webRequest.onBeforeRequest.addListener(
	request => {
		const isBlocked = BANNED_WORDS_REGEX.test(request.url.replace(WHITELISTED_WORDS_REGEX, "")) &&
			!WHITELISTED_URLS.some(url => request.url.includes(url))
		if(isBlocked) {
			console.log("Intercepted: " + request.url)
		}
		return {cancel: isBlocked}
	},
	{
		urls: [
			"<all_urls>"
		]
	},
	["blocking"] // Makes listener synchronous
)

console.info("Blocker is ready")
