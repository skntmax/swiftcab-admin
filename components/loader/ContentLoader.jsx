'use client'
import React from 'react'
import { Box, CircularProgress } from '@node_modules/@mui/material';

function ContentLoader({style}) {
  return (
    <>
            <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: "10px",
           
            }}
        >
          <CircularProgress 
        style={{
            width:"20px",
            height:"20px"
          }}
          />

        </Box>
    </>
  )
}

export default ContentLoader