import Pagination from "@mui/material/Pagination"
import Typography from "@mui/material/Typography"
import styles from "./TasksPagination.module.css"
import { PAGE_SIZE } from "@/common/constants"
import { ChangeEvent } from "react"

type Props = {
  totalCount: number
  page: number
  setPage: (page: number) => void
}

export const TasksPagination = ({ totalCount, page, setPage }: Props) => {
  const changePage = (_: ChangeEvent<unknown>, page: number) => {
    setPage(page)
  }

  const pageCount = Math.ceil(totalCount / PAGE_SIZE)
  const shouldShowPagination = totalCount > PAGE_SIZE


    return (
      <>
        {shouldShowPagination && (
          <Pagination
            count={pageCount}
            page={page}
            onChange={changePage}
            shape={"rounded"}
            color={"primary"}
            className={styles.pagination}
          />
        )}
        <div className={styles.totalCount}>
          <Typography variant={"caption"}>Total: {totalCount}</Typography>
        </div>
      </>
    )
}
