import ProfileForm from '@/module/settings/components/profile-form'
import RepositoryList from '@/module/settings/components/repository-list'
import React from 'react'

const SettingsPage = () => {
  return (
    <div className='space-y-6'>
        <div>
            <h1>Settings</h1>
            <p>Manage your account settings and connected repositories</p>
        </div>
        <ProfileForm/>
        <RepositoryList/>
    </div>
  )
}

export default SettingsPage