import React from 'react'

const Title = ({ title, extraClassName }) => {
    return (
        <h1 className={`pointer-events-none whitespace-pre-wrap bg-gradient-to-br bg-clip-text text-4xl  leading-none text-transparent from-black to-gray-500/80 dark:from-white dark:to-gray-300/80 font-medium tracking-tighter text-balance animate-fade-in [--animation-delay:200ms] ${extraClassName}`}>
            {title}
        </h1>
    )
}

export default Title