'use client'
import React, { useEffect } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Chip, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useDriverFaqsMutation } from '@app/libs/apis/driver'

function DriverFaqs() {
  const [load, { data, isLoading }] = useDriverFaqsMutation()

  useEffect(() => {
    load()
  }, [])

  const rows = Array.isArray(data?.data) ? data.data : []

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>FAQs</Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Common questions for accepting rides, KYC, payouts, and support.
      </Typography>
      {isLoading ? (
        <Typography>Loading FAQs…</Typography>
      ) : (
        <div style={{ maxWidth: 1100 }}>
          {rows.map((row) => (
            <Accordion key={row.id} disableGutters sx={{ mb: 1, borderRadius: 2, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Chip size="small" label={row.category} sx={{ mr: 1.5 }} />
                <Typography fontWeight={600}>{row.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{row.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      )}
    </>
  )
}

export default DriverFaqs
