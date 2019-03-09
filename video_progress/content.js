let lastLocation


const hasNavigated = () => {
    const currLocation = window.location.toString()
    if (currLocation !== lastLocation) {
        lastLocation = currLocation
        return true
    }
    return false
}


const isOnWatchPage = () => window.location.pathname === "/watch"

const getCurrentVideoID = () => window.location.search.match(/\?v=(\w+)/)[1]



let backgroundPort


const connectToBackground = () => {
    console.info("Connecting to background...")

    backgroundPort = browser.runtime.connect()

    backgroundPort.onDisconnect = () => {
        if (shouldBeConnected) {
            connectToBackground()
        }
    }

    backgroundPort.onMessage.addListener(handleMessage);
}


const handleMessage = message => {
    switch(message.action) {
        case "loadProgress":
            handleLoadResponse(message)
            break
    }
}


const disconnectFromBackground = () => {
    console.info("Disconnecting from background...")

    backgroundPort.disconnect()

    backgroundPort = null
}


const isConnectedToBackground = () => backgroundPort != null



const VIDEO_DURATION_THRESHOLD = 20 * 60  // 20 minutes

let player
let progressRequestIsPending = false


const findPlayer = () => {
    player = document.querySelector("video")

    if (!player) {
        console.error("Player not found")
    }
}


const videoIsAboveThreshold = () => player.duration >= VIDEO_DURATION_THRESHOLD


const saveCurrentProgress = () => {
    console.log("Saving current progress...")

    backgroundPort.postMessage({
        action: "saveProgress",
        videoID: getCurrentVideoID(),
        progress: player.currentTime,
        duration: player.duration
    })
}


const requestSavedProgress = () => {
    console.log("Requesting saved progress...")
    progressRequestIsPending = true

    backgroundPort.postMessage({
        action: "loadProgress",
        videoID: getCurrentVideoID()
    })
}


const handleLoadResponse = message => {
    if(getCurrentVideoID() === message.videoID) {
        if (message.data) {
            insertVideoProgress(message.data.progress)
        }
        progressRequestIsPending = false
    }
}


const insertVideoProgress = progress => {
    console.info("Inserting video progress...")
    player.currentTime = progress
}



const TICK_TIMEOUT_NORMAL = 2000
const TICK_TIMEOUT_HIBERNATE = 5000

let hibernate = false


const setNextTick = () => setTimeout(() => tick(), hibernate ? TICK_TIMEOUT_HIBERNATE : TICK_TIMEOUT_NORMAL)

const tick = () => {
    const _hasNavigated = hasNavigated()
    const _isOnWatchpage = isOnWatchPage()

    if (_isOnWatchpage) {
        if (_hasNavigated) {
            setUpNewWatchPage()
        } else if (videoIsAboveThreshold() && !progressRequestIsPending) {
            saveCurrentProgress()
        }
    } else if (_hasNavigated && isConnectedToBackground()) {
        disconnectFromBackground()
    }

    hibernate = !_isOnWatchpage
    setNextTick()
}


const setUpNewWatchPage = () =>
    setTimeout(() => {
        findPlayer()

        if (videoIsAboveThreshold()) {
            if (!isConnectedToBackground()) {
                connectToBackground()
            }

            requestSavedProgress()
        }
    }, 100)


console.info("Initializing video progress saver on this tab...")
setNextTick()

