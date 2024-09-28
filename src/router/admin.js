import AdminLayout from "../layouts/AdminLayout.vue";
import AuctionManagement from "../views/admin/auctionManagement/index.vue";
import UserManagement from "../views/admin/userManagement/index.vue";
import AuctionViewDetail from "../views/admin/auctionViewDetail/index.vue";
const adminRoutes = [
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "auctionManagement",
        name: "auction-management",
        component: AuctionManagement
      },
      {
        path: "userManagement",
        name: "user-management",
        component: UserManagement
      },
      {
        path: "auction/:id",
        name: "auctionViewDetail",
        component: AuctionViewDetail,
        props: true
      }
    ]
  }
];

export default adminRoutes;
