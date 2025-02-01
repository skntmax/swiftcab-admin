import React from 'react'

function page(props) {
         const { params:{ userType  , username }} = props

     return (
    <div>
       {username+ userType}
    </div>
  )
}

export default page
