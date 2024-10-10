import AdminLayout from "../layouts/AdminLayout.vue";
import AuctionManagement from "../views/admin/auctionManagement/index.vue";
import UserManagement from "../views/admin/userManagement/index.vue";
import AuctionViewFinished from "../views/admin/auctionViewFinished/index.vue";
import AuctionViewInProgress from "../views/admin/auctionViewInProgress/index.vue";
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
        path: "auction/finished/:id",
        name: "AuctionViewFinished",
        component: AuctionViewFinished,
        props: true
      },
      {
        path: "auction/in-progress/:id",
        name: "AuctionViewInProgress",
        component: AuctionViewInProgress,
        props: true
      }
    ]
  }
];

export default adminRoutes;
