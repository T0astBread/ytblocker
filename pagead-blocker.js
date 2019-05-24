(() => {
    const ONPAGE_AD_SELECTOR = "#masthead-ad"
    const DELETION_TIMEOUT = 2000, MAX_DELETION_TIMEOUT = 6000


    const deleteAnyAdsPresent = () => {
        const onpageAds = document.querySelectorAll(ONPAGE_AD_SELECTOR)

        if(onpageAds.length > 0) {
            onpageAds.forEach(node => node.remove())
            console.info(`[YTBLOCKER] ${onpageAds.length} ad${onpageAds.length > 1 ? "s" : ""} obliterated ✅`)
        }

        console.debug("[YTBLOCKER] Ran page ad check")
        lastUnfulfilledDeletionAttempt = null
    }


    let currentDeletionTimeout = null
    let lastUnfulfilledDeletionAttempt = null

    const scheduleAdDeletion = () => {
        if(lastUnfulfilledDeletionAttempt === null)
            lastUnfulfilledDeletionAttempt = Date.now()
        else if(Date.now() - lastUnfulfilledDeletionAttempt > MAX_DELETION_TIMEOUT) {
            deleteAnyAdsPresent()
            return
        }

        if(currentDeletionTimeout)
            clearTimeout(currentDeletionTimeout)

        currentDeletionTimeout = setTimeout(deleteAnyAdsPresent, DELETION_TIMEOUT)
    }


    const observer = new MutationObserver(scheduleAdDeletion)
    
    const startObserving = () => observer.observe(
        document.body,
        { childList: true, subtree: true, attributes: false }
    )


    setTimeout(startObserving, 1000)
})()
