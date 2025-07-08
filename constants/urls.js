export default {
    get_role: "v1/auth/get-all-roles",
    get_vehicles_list: 'v1/admin/get-all-vhicles',
    insert_owner_vhicles: 'v1/owner/insert-owner-vhicles',
    owner_ownes_vhicle: "v1/owner/owner-ownes-vhicle",
    owner_service_list: "v1/owner/owner-active-vhicle-list",
    "owner_varified_vhicles":"v1/owner/owner-varified-vhicle-list",
    admin_service_list: "v1/admin/service-list",
    owner_active_vhicle_service_list: "v1/owner/get-vhicle-services-list",
    owner_kyc_request: "/v1/owner/kyc-request",
    assign_driver_to_vhicle:"v1/owner/assign-driver-to-vhicle",


    //  admin api 

    'get_active_users': "v1/admin/get-active-users",
    'get_vhicle_details': "v1/admin/get-vhicle-details",
    'update_kyc_status': "v1/admin/approve-kyc-request",
    'block_unblock_user': "v1/admin/block-unblock-user",
    "get_user_by_role":"v1/admin/get-user-by-role",
     
    // master api
    "get_vhicle_type":"v1/master/get-vhicle-type",
    "add_role_to_users":"v1/admin/add-role-to-users",
    "add_navbar":"v1/admin/add-navbar", 
    "get_navbar_list":"v1/admin/get-navbar-list",
    "add_subnavbar":"v1/admin/add-subnavbar",
    "get_banks":"v1/master/get-banks",
    "get_bank_branch":"v1/master/get-bank-branches",
    "get_driver_list":"v1/master/get-driver-list",

    // driver api 
    "assing_menu_roles":"v1/admin/add-menu",
    "get_driver_details":"v1/driver/get-driver-details"


}

