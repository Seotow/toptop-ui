import { useEffect, useState } from 'react'
import Context from './Context'
import { getUserInfo } from '~/services/userService'

function Provider({ children }) {
    const [currentUser, setCurrentUser] = useState({})
    useEffect(() => {
        let mounted = true

        ;(async () => {
            const data = await getUserInfo()
            if(mounted)
                setCurrentUser(data)
        })()

        return () => mounted = false
    }, [])

    return <Context.Provider value={currentUser}>{children}</Context.Provider>
}

export default Provider
