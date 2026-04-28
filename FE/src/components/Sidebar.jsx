const menuItems = [
  {
    key: "single",
    label: "Phân loại",
  },
  {
    key: "batch",
    label: "Phân loại hàng loạt",
  },
  {
    key: "history",
    label: "Lịch sử",
  },
  {
    key: "dashboard",
    label: "Thống kê",
  },
  {
    key: "feedback",
    label: "Feedback",
  },
  {
    key: "model-info",
    label: "Model Info",
  },
  {
    key: "labels",
    label: "Danh sách nhãn",
  },
];

function Sidebar({ currentPage, onChangePage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Menu</div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onChangePage(item.key)}
            className={
              currentPage === item.key
                ? "sidebar-item sidebar-item-active"
                : "sidebar-item"
            }
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;