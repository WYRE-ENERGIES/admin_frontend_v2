import React, { Suspense, lazy, useState, useTransition } from 'react'

import { Button, Space, Typography } from 'antd'
// import { ReactComponent as Logo } from '../../../assets/icon.svg'
import { MdNorthEast } from 'react-icons/md'
// import PageBreadcrumb from '../../../components/PageBreadcrumb/PageBreadcrumb'
// import PageLayout from '../../../components/Layout/PageLayout'
// import TableFooter from '../../../components/TableFooter/TableFooter'
// import TicketTable from './TicketTable/TicketTable'
// import from './Support.module.scss'
import TableFooter from './TableFooter'
import TicketTable from './TicketTable'
// import { useGetClientSupportTicketsQuery } from '../../../features/slices/supportSlice'

const TicketForm = lazy(() => import('./TicketForm'))
const data = [
  { title: 'Contact Us', description: 'Wyre Support Mediums', icon: false },
  { title: 'Phone Number', description: '070-----***', icon: true },
  { title: 'Email', description: 'hello@wyreng.com', icon: true },
]

const InnerCard = ({ title, description, icon }) => (
  <div className={''}>
    <p className={''}>{title}</p>
    <p className={''}>
      {/* {!icon && <Logo className={classes.Support__logo} />} */}
      {description}
      {icon && <MdNorthEast className={''} size={12} />}
    </p>
  </div>
)

const Support = () => {
  const [openModal, setOpenModal] = useState(false)
  const [ticketData, setTicketData] = useState({})
  const [isPending, startTransition] = useTransition()
  const [page, setPage] = useState(1)

  const toggleModal = () => setOpenModal(!openModal)

  const handleEditTicket = (data) => {
    startTransition(() => {
      setTicketData((prev) => ({ ...prev, ...data }))
      toggleModal()
    })
  }
  const { data: supportData, isFetching } =
    // useGetClientSupportTicketsQuery(page)
    ''

  return (
    <div className='total-energy-bar-chart'>
      {/* <div className="AppHeader">
        <Typography.Title style={{ fontSize: "30Px", fontWeight: "bold" }}>
          Suppport
        </Typography.Title>
      </div>
      <Space>
          <div>
            <Button
              style={{ backgroundColor: "#5C12A7", color: "white" }}
              onClick={(e) => {
                e.preventDefault();
                setShowAddButton(true);
                setShowEditForm(false);
                console.log("This button is expecting Actions");
              }}
            >
              <PlusOutlined />
              Create Ticket
            </Button>
          </div>
      </Space> */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h1
                  style={{
                    fontSize: "22Px",
                  }}
                >
                  Support
                  {/* {moveLegend} */}
                </h1>
              </div>
              <div>
                <Button
                  style={{
                    width: 150,
                    background: '#5C12A7',
                    color: 'white',
                    marginRight: 10,
                    // height: 43
                  }}
                >Create Ticket</Button>
              </div>
            </div>
      <div className={Support} style={{ backgroundColor: '#FCFCFD' }}>
        <section className={''}>
          {/* <PageBreadcrumb title="Support" items={['Support']} /> */}
          {/* <Button
            className={''}
            onClick={() => {
              startTransition(() => {
                setTicketData({})
                toggleModal()
              })
            }}
          >
            Create Ticket
          </Button> */}
        </section>
        <section className={''}>
          <TicketTable
            onEditTicket={handleEditTicket}
            loading={isFetching}
            data={supportData?.results}
            footer={() => (
              <TableFooter
                pageNo={supportData?.page}
                totalPages={supportData?.total_pages}
                handleClick={setPage}
                hasNext={supportData?.page === supportData?.total_pages}
                hasPrev={!supportData?.total_pages || supportData?.page === 1}
              />
            )}
          />
        </section>
        <section className= "support_bottomSection">
          {data.map((item, index) => (
            <InnerCard
              key={`${item.title} ${index}`}
              title={item.title}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </section>
      </div>
      <Suspense fallback="loading">
        {openModal && (
          <TicketForm
            title="Create Ticket"
            isOpen={openModal}
            toggleModal={toggleModal}
            ticketData={ticketData}
            isAdmin={false}
          />
        )}
      </Suspense>
    </div>
  )
}

export default Support
