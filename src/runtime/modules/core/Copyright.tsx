import React from 'react'

export function Copyright(): JSX.Element {
  const openBotLabs = (): void => {
    void chrome.tabs.create({
      url: 'https://botlabs.org/',
      selected: true,
    })
  }

  return (
    <Text variant="body2" color="text.secondary" align="center" onClick={openBotLabs}>
      <Link color="inherit" href={'https://botlabs.org/'}>
        {'Copyright Botlabs GmbH '}
        {new Date().getFullYear()}.
      </Link>
    </Text>
  )
}
