
export const MainLayout = ({ sideBar, children }: { sideBar: React.ReactNode, children: React.ReactNode }) => {
  return <>
    <div className="side-bar">
      {sideBar}
    </div>
    <main className="content">
      {children}
    </main>
  </>
}
