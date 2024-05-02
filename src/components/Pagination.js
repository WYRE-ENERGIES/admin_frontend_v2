import React from "react";

import { Button } from "antd";

const Pagination = ({totalPosts, postsPerPage, setCurrentPage}) => {
    let pages = [];

     for (let i = 1; i <= Math.ceil(totalPosts | postsPerPage); i++) {
        pages.push(i);     
     }

     console.log("Pages==============", pages);

  return (
    <div className="pagination">
        {pages.map((page, index) => {
            return <Button key={index} onClick={() => setCurrentPage(page)}>{page}</Button>
        })}
    </div>
  );
}

export default Pagination;
