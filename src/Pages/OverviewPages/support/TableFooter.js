import { Button } from 'antd'
import React from 'react'
// import classes from './TableFooter.module.scss'

const TableFooter = ({ handleClick, pageNo, totalPages, hasNext, hasPrev }) => {
  return (
    <section className='' style={{width: "100%"}}>
      <div className={''} style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <Button disabled={hasPrev} onClick={(e) => handleClick(pageNo - 1)}>
          Previous
        </Button>
        <Button disabled={hasNext} onClick={(e) => handleClick(pageNo + 1)}>
          Next
        </Button>
      </div>
      <div className={''}>
        {totalPages ? `Page ${pageNo} of ${totalPages}` : ''}
      </div>
    </section>
  )
}

export default TableFooter
