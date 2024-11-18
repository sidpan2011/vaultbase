import React from 'react'
import Title from './Title'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Menu } from 'lucide-react'

const Welcome = () => {
    return (
        <div className='flex flex-row items-center space-x-4 p-3'>
            <div className='flex flex-row items-center justify-between w-full'>
                <div className='flex flex-row items-center space-x-2'>
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Title title="Sidhanth Pandey" />
                </div>
            </div>
            <div className="flex items-center">
                <Menu className="cursor-pointer" />
            </div>

        </div>
    )
}

export default Welcome