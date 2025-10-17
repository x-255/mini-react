export const getCurrentTime  = () => performance.now()

export const isArray = (sth: any): sth is any[] => Array.isArray(sth)

export const isObject = (sth: any): sth is Record<string, any> => sth !== null && typeof sth === 'object' && !isArray(sth)

export const isFn = (sth: any): sth is (...args: any[]) => any => typeof sth === 'function'

export const isStr = (sth: any): sth is string => typeof sth === 'string'

export const isNum = (sth: any): sth is number => typeof sth === 'number'
