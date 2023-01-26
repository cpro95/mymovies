import { createCookieSessionStorage } from "@remix-run/node";
import { getRequiredServerEnvVar } from './utils'
import { Theme, isTheme } from './theme-provider'

const themeStorage = createCookieSessionStorage({
    cookie: {
        name: 'mymovies_theme',
        secure: true,
        secrets: [getRequiredServerEnvVar('SESSION_SECRET')],
        sameSite: 'lax',
        path: '/',
        expires: new Date('2088-10-18'),
        httpOnly: true,
    },
})

async function getThemeSession(request: Request) {
    const session = await themeStorage.getSession(request.headers.get('Cookie'))
    return {
        getTheme: () => {
            const themeValue = session.get('mymovies_theme')
            return isTheme(themeValue) ? themeValue : Theme.LIGHT
        },
        setTheme: (theme: Theme) => session.set('mymovies_theme', theme),
        commit: () => themeStorage.commitSession(session),
    }
}

export { getThemeSession }