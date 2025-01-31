import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'; 

function ApiLoader({width , height}) {
  return (
    
    <>

<div className="d-flex justify-content-center align-items-center"  >
            <div className="spinner-border text-primary" role="status" style={{width , height }}>
            </div>
          </div>

    </>
  )
}

export default ApiLoader