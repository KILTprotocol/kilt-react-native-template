import React from 'react'

import { CacheTimeSelect } from './CacheTimeSelect'

interface YesNoProps {
  title: string
  children: React.ReactNode
  onYes: (cacheSeconds: number) => void
  onNo: () => void
}

export default function YesNo(props: YesNoProps): JSX.Element {
  const [cacheSeconds, setCacheSeconds] = React.useState(0)
  return (
    <Container sx={{ textAlign: 'center' }}>
      <Box>
        <Text>{props.title}</Text>
        <Grid container alignItems="center" justifyContent="center">
          <Grid item xs={12}>
            {props.children}
          </Grid>
          <Grid item xs={8}>
            <CacheTimeSelect onSelect={setCacheSeconds} />
          </Grid>
          <Grid item xs={6}>
            <TouchableOpacity
              variant="contained"
              color="error"
              onClick={() => {
                props.onNo()
              }}
            >
              No
            </TouchableOpacity>
          </Grid>
          <Grid item xs={6}>
            <TouchableOpacity
              variant="contained"
              color="success"
              onClick={() => {
                props.onYes(cacheSeconds)
              }}
            >
              Yes
            </TouchableOpacity>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}
