console.info("Initializing...")

const WHITELISTED_WORDS_REGEX = /load|add|adapter/g
const BANNED_WORDS_REGEX = /ad|track|log|stats|midroll/  // Don't put a "g" flag at the end - it won't work!
const WHITELISTED_URLS = ["youtube.com/results?search_query=", "youtube.com/watch"]

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
