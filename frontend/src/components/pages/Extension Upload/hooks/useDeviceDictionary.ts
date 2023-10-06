import { wait } from "../../../../helpers/rcapi"
import { Message } from "../../../../models/Message"
import { SyncError } from "../../../../models/SyncError"
import { RestCentral } from "../../../../rcapi/RestCentral"
import { Device } from "../../Migration/User Data Download/models/UserDataBundle"

const defaultDevices = [
    {
        "sku": "HP-87",
        "skuId": "LC_HD_746",
        "type": "HardPhone",
        "model": {
            "id": "87",
            "name": "Avaya B199",
            "deviceClass": "ConferencePhone",
            "lineCount": 2,
            "addons": [],
            "features": []
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-85",
        "skuId": "LC_HD_740",
        "type": "HardPhone",
        "model": {
            "id": "85",
            "name": "Avaya J139",
            "deviceClass": "DeskPhone",
            "lineCount": 96,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-89",
        "skuId": "LC_HD_752",
        "type": "HardPhone",
        "model": {
            "id": "89",
            "name": "Avaya J159",
            "deviceClass": "DeskPhone",
            "lineCount": 96,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-86",
        "skuId": "LC_HD_743",
        "type": "HardPhone",
        "model": {
            "id": "86",
            "name": "Avaya J179",
            "deviceClass": "DeskPhone",
            "lineCount": 96,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-86-9-1",
        "skuId": "LC_HD_758",
        "type": "HardPhone",
        "model": {
            "id": "86",
            "name": "Avaya J179",
            "deviceClass": "DeskPhone",
            "lineCount": 120,
            "addons": [
                {
                    "id": "9",
                    "name": "Avaya - 24 lines",
                    "count": 1
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-86-9-2",
        "skuId": "LC_HD_759",
        "type": "HardPhone",
        "model": {
            "id": "86",
            "name": "Avaya J179",
            "deviceClass": "DeskPhone",
            "lineCount": 144,
            "addons": [
                {
                    "id": "9",
                    "name": "Avaya - 24 lines",
                    "count": 2
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-86-9-3",
        "skuId": "LC_HD_760",
        "type": "HardPhone",
        "model": {
            "id": "86",
            "name": "Avaya J179",
            "deviceClass": "DeskPhone",
            "lineCount": 168,
            "addons": [
                {
                    "id": "9",
                    "name": "Avaya - 24 lines",
                    "count": 3
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-159",
        "skuId": "LC_HD_982",
        "type": "HardPhone",
        "model": {
            "id": "159",
            "name": "Cisco 191 ATA ",
            "deviceClass": "AnalogAdapter",
            "lineCount": 2,
            "addons": [],
            "features": []
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-160",
        "skuId": "LC_HD_983",
        "type": "HardPhone",
        "model": {
            "id": "160",
            "name": "Cisco 192 ATA ",
            "deviceClass": "AnalogAdapter",
            "lineCount": 2,
            "addons": [],
            "features": []
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-84",
        "skuId": "LC_HD_590",
        "type": "HardPhone",
        "model": {
            "id": "84",
            "name": "Cisco CP-6821 Desk Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 2,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-73",
        "skuId": "LC_HD_522",
        "type": "HardPhone",
        "model": {
            "id": "73",
            "name": "Cisco CP-7841 Desk Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 4,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-83",
        "skuId": "LC_HD_580",
        "type": "HardPhone",
        "model": {
            "id": "83",
            "name": "Cisco CP-8851 Desk Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 10,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-83-8-1",
        "skuId": "LC_HD_581",
        "type": "HardPhone",
        "model": {
            "id": "83",
            "name": "Cisco CP-8851 Desk Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 38,
            "addons": [
                {
                    "id": "8",
                    "name": "Cisco - 28 lines",
                    "count": 1
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-83-8-2",
        "skuId": "LC_HD_582",
        "type": "HardPhone",
        "model": {
            "id": "83",
            "name": "Cisco CP-8851 Desk Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 66,
            "addons": [
                {
                    "id": "8",
                    "name": "Cisco - 28 lines",
                    "count": 2
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-74",
        "skuId": "LC_HD_523",
        "type": "HardPhone",
        "model": {
            "id": "74",
            "name": "Cisco CP-8861 Desk Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 10,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-161",
        "skuId": "LC_HD_1020",
        "type": "HardPhone",
        "model": {
            "id": "161",
            "name": "Mitel 6905 IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 1,
            "addons": [],
            "features": []
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-162",
        "skuId": "LC_HD_1023",
        "type": "HardPhone",
        "model": {
            "id": "162",
            "name": "Mitel 6910 IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 2,
            "addons": [],
            "features": [
                "Intercom",
                "Paging"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-175",
        "skuId": "LC_HD_1029",
        "type": "HardPhone",
        "model": {
            "id": "175",
            "name": "Mitel 6920W IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 20,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-176",
        "skuId": "LC_HD_1032",
        "type": "HardPhone",
        "model": {
            "id": "176",
            "name": "Mitel 6930W IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 44,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-177",
        "skuId": "LC_HD_1035",
        "type": "HardPhone",
        "model": {
            "id": "177",
            "name": "Mitel 6940W IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 48,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-163",
        "skuId": "LC_HD_1026",
        "type": "HardPhone",
        "model": {
            "id": "163",
            "name": "Mitel 6970 IP Phone",
            "deviceClass": "ConferencePhone",
            "lineCount": 48,
            "addons": [],
            "features": [
                "Intercom",
                "Paging"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-126",
        "skuId": "LC_HD_949",
        "type": "HardPhone",
        "model": {
            "id": "126",
            "name": "Poly CCX400 Business Media Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 24,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-127",
        "skuId": "LC_HD_950",
        "type": "HardPhone",
        "model": {
            "id": "127",
            "name": "Poly CCX500 Business Media Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 24,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-128",
        "skuId": "LC_HD_951",
        "type": "HardPhone",
        "model": {
            "id": "128",
            "name": "Poly CCX600 Business Media Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 54,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-129",
        "skuId": "LC_HD_952",
        "type": "HardPhone",
        "model": {
            "id": "129",
            "name": "Poly CCX700 Business Media Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 54,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-189",
        "skuId": "LC_HD_984",
        "type": "HardPhone",
        "model": {
            "id": "189",
            "name": "Poly Edge E100 IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 8,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-178",
        "skuId": "LC_HD_1038",
        "type": "HardPhone",
        "model": {
            "id": "178",
            "name": "Poly Edge E220 IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 16,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-179",
        "skuId": "LC_HD_1041",
        "type": "HardPhone",
        "model": {
            "id": "179",
            "name": "Poly Edge E320 IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 32,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-180",
        "skuId": "LC_HD_1044",
        "type": "HardPhone",
        "model": {
            "id": "180",
            "name": "Poly Edge E350 IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 32,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-181",
        "skuId": "LC_HD_1047",
        "type": "HardPhone",
        "model": {
            "id": "181",
            "name": "Poly Edge E450 IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 44,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-182",
        "skuId": "LC_HD_1050",
        "type": "HardPhone",
        "model": {
            "id": "182",
            "name": "Poly Edge E550 IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 48,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-143-17-1",
        "skuId": "LC_HD_980",
        "type": "HardPhone",
        "model": {
            "id": "143",
            "name": "Poly Rove 30 + B2 DECT Wireless Phone Kit",
            "deviceClass": "CordlessPhone",
            "lineCount": 20,
            "addons": [
                {
                    "id": "17",
                    "name": "Poly Handset",
                    "count": 1
                }
            ],
            "features": []
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-144-17-1",
        "skuId": "LC_HD_981",
        "type": "HardPhone",
        "model": {
            "id": "144",
            "name": "Poly Rove 40 + B2 DECT Wireless Phone Kit",
            "deviceClass": "CordlessPhone",
            "lineCount": 20,
            "addons": [
                {
                    "id": "17",
                    "name": "Poly Handset",
                    "count": 1
                }
            ],
            "features": []
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-134",
        "skuId": "LC_HD_953",
        "type": "HardPhone",
        "model": {
            "id": "134",
            "name": "Poly Trio C60 Smart Conference Phone",
            "deviceClass": "ConferencePhone",
            "lineCount": 2,
            "addons": [],
            "features": []
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-141-17-1",
        "skuId": "LC_HD_977",
        "type": "HardPhone",
        "model": {
            "id": "141",
            "name": "Poly VVX D230 Cordless IP Phone",
            "deviceClass": "CordlessPhone",
            "lineCount": 8,
            "addons": [
                {
                    "id": "17",
                    "name": "Poly Handset",
                    "count": 1
                }
            ],
            "features": []
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-100",
        "skuId": "LC_HD_936",
        "type": "HardPhone",
        "model": {
            "id": "100",
            "name": "Polycom RealPresence Trio 8300",
            "deviceClass": "ConferencePhone",
            "lineCount": 2,
            "addons": [],
            "features": []
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-69",
        "skuId": "LC_HD_528",
        "type": "HardPhone",
        "model": {
            "id": "69",
            "name": "Polycom RealPresence Trio 8800",
            "deviceClass": "ConferencePhone",
            "lineCount": 2,
            "addons": [],
            "features": []
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-77",
        "skuId": "LC_HD_609",
        "type": "HardPhone",
        "model": {
            "id": "77",
            "name": "Polycom VVX250",
            "deviceClass": "DeskPhone",
            "lineCount": 4,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-78",
        "skuId": "LC_HD_610",
        "type": "HardPhone",
        "model": {
            "id": "78",
            "name": "Polycom VVX350",
            "deviceClass": "DeskPhone",
            "lineCount": 6,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-79",
        "skuId": "LC_HD_611",
        "type": "HardPhone",
        "model": {
            "id": "79",
            "name": "Polycom VVX450",
            "deviceClass": "DeskPhone",
            "lineCount": 12,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-79-7-1",
        "skuId": "LC_HD_687",
        "type": "HardPhone",
        "model": {
            "id": "79",
            "name": "Polycom VVX450",
            "deviceClass": "DeskPhone",
            "lineCount": 102,
            "addons": [
                {
                    "id": "7",
                    "name": "Polycom - 90 lines",
                    "count": 1
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-91",
        "skuId": "LC_HD_650",
        "type": "HardPhone",
        "model": {
            "id": "91",
            "name": "Unify CP205",
            "deviceClass": "DeskPhone",
            "lineCount": 10,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-92",
        "skuId": "LC_HD_651",
        "type": "HardPhone",
        "ruleType": "OutOfStock",
        "model": {
            "id": "92",
            "name": "Unify CP400",
            "deviceClass": "DeskPhone",
            "lineCount": 18,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-92-12-1",
        "skuId": "LC_HD_656",
        "type": "HardPhone",
        "ruleType": "OutOfStock",
        "model": {
            "id": "92",
            "name": "Unify CP400",
            "deviceClass": "DeskPhone",
            "lineCount": 50,
            "addons": [
                {
                    "id": "12",
                    "name": "Unify - 32 lines",
                    "count": 1
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-93",
        "skuId": "LC_HD_652",
        "type": "HardPhone",
        "ruleType": "OutOfStock",
        "model": {
            "id": "93",
            "name": "Unify CP600",
            "deviceClass": "DeskPhone",
            "lineCount": 14,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-93-10-1",
        "skuId": "LC_HD_654",
        "type": "HardPhone",
        "ruleType": "OutOfStock",
        "model": {
            "id": "93",
            "name": "Unify CP600",
            "deviceClass": "DeskPhone",
            "lineCount": 38,
            "addons": [
                {
                    "id": "10",
                    "name": "Unify - 24 lines",
                    "count": 1
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-93-10-2",
        "skuId": "LC_HD_655",
        "type": "HardPhone",
        "ruleType": "OutOfStock",
        "model": {
            "id": "93",
            "name": "Unify CP600",
            "deviceClass": "DeskPhone",
            "lineCount": 62,
            "addons": [
                {
                    "id": "10",
                    "name": "Unify - 24 lines",
                    "count": 2
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-98",
        "skuId": "LC_HD_591",
        "type": "HardPhone",
        "ruleType": "OutOfStock",
        "model": {
            "id": "98",
            "name": "Unify CP700",
            "deviceClass": "DeskPhone",
            "lineCount": 14,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-98-10-1",
        "skuId": "LC_HD_657",
        "type": "HardPhone",
        "ruleType": "OutOfStock",
        "model": {
            "id": "98",
            "name": "Unify CP700",
            "deviceClass": "DeskPhone",
            "lineCount": 38,
            "addons": [
                {
                    "id": "10",
                    "name": "Unify - 24 lines",
                    "count": 1
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-98-10-2",
        "skuId": "LC_HD_658",
        "type": "HardPhone",
        "ruleType": "OutOfStock",
        "model": {
            "id": "98",
            "name": "Unify CP700",
            "deviceClass": "DeskPhone",
            "lineCount": 62,
            "addons": [
                {
                    "id": "10",
                    "name": "Unify - 24 lines",
                    "count": 2
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-145",
        "skuId": "LC_HD_350",
        "type": "HardPhone",
        "ruleType": "OutOfStock",
        "model": {
            "id": "145",
            "name": "Unify CP700X",
            "deviceClass": "DeskPhone",
            "lineCount": 14,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-145-10-1",
        "skuId": "LC_HD_351",
        "type": "HardPhone",
        "ruleType": "OutOfStock",
        "model": {
            "id": "145",
            "name": "Unify CP700X",
            "deviceClass": "DeskPhone",
            "lineCount": 38,
            "addons": [
                {
                    "id": "10",
                    "name": "Unify - 24 lines",
                    "count": 1
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-145-10-2",
        "skuId": "LC_HD_352",
        "type": "HardPhone",
        "ruleType": "OutOfStock",
        "model": {
            "id": "145",
            "name": "Unify CP700X",
            "deviceClass": "DeskPhone",
            "lineCount": 62,
            "addons": [
                {
                    "id": "10",
                    "name": "Unify - 24 lines",
                    "count": 2
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-147",
        "skuId": "LC_HD_978",
        "type": "HardPhone",
        "model": {
            "id": "147",
            "name": "Yealink CP925 - Touch-Sensitive IP Conference Phone",
            "deviceClass": "ConferencePhone",
            "lineCount": 1,
            "addons": [],
            "features": [
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-148",
        "skuId": "LC_HD_979",
        "type": "HardPhone",
        "model": {
            "id": "148",
            "name": "Yealink CP965 - Touch-Sensitive IP Conference Phone",
            "deviceClass": "ConferencePhone",
            "lineCount": 1,
            "addons": [],
            "features": [
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-101",
        "skuId": "LC_HD_937",
        "type": "HardPhone",
        "model": {
            "id": "101",
            "name": "Yealink T33G",
            "deviceClass": "DeskPhone",
            "lineCount": 4,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Enabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-135",
        "skuId": "LC_HD_956",
        "type": "HardPhone",
        "model": {
            "id": "135",
            "name": "Yealink T43U Ultra-elegant Gigabit IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 21,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-135-16-1",
        "skuId": "LC_HD_967",
        "type": "HardPhone",
        "model": {
            "id": "135",
            "name": "Yealink T43U Ultra-elegant Gigabit IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 81,
            "addons": [
                {
                    "id": "16",
                    "name": "Yealink EXP43",
                    "count": 1
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-135-16-2",
        "skuId": "LC_HD_968",
        "type": "HardPhone",
        "model": {
            "id": "135",
            "name": "Yealink T43U Ultra-elegant Gigabit IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 141,
            "addons": [
                {
                    "id": "16",
                    "name": "Yealink EXP43",
                    "count": 2
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-136",
        "skuId": "LC_HD_957",
        "type": "HardPhone",
        "model": {
            "id": "136",
            "name": "Yealink T46U Ultra-elegant Gigabit IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 27,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-136-16-1",
        "skuId": "LC_HD_969",
        "type": "HardPhone",
        "model": {
            "id": "136",
            "name": "Yealink T46U Ultra-elegant Gigabit IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 87,
            "addons": [
                {
                    "id": "16",
                    "name": "Yealink EXP43",
                    "count": 1
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-136-16-2",
        "skuId": "LC_HD_970",
        "type": "HardPhone",
        "model": {
            "id": "136",
            "name": "Yealink T46U Ultra-elegant Gigabit IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 147,
            "addons": [
                {
                    "id": "16",
                    "name": "Yealink EXP43",
                    "count": 2
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-137",
        "skuId": "LC_HD_958",
        "type": "HardPhone",
        "model": {
            "id": "137",
            "name": "Yealink T48U Ultra-elegant Gigabit IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 29,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-137-16-1",
        "skuId": "LC_HD_971",
        "type": "HardPhone",
        "model": {
            "id": "137",
            "name": "Yealink T48U Ultra-elegant Gigabit IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 89,
            "addons": [
                {
                    "id": "16",
                    "name": "Yealink EXP43",
                    "count": 1
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-137-16-2",
        "skuId": "LC_HD_972",
        "type": "HardPhone",
        "model": {
            "id": "137",
            "name": "Yealink T48U Ultra-elegant Gigabit IP Phone",
            "deviceClass": "DeskPhone",
            "lineCount": 149,
            "addons": [
                {
                    "id": "16",
                    "name": "Yealink EXP43",
                    "count": 2
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-119",
        "skuId": "LC_HD_954",
        "type": "HardPhone",
        "model": {
            "id": "119",
            "name": "Yealink T53W",
            "deviceClass": "DeskPhone",
            "lineCount": 21,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-119-11-1",
        "skuId": "LC_HD_973",
        "type": "HardPhone",
        "model": {
            "id": "119",
            "name": "Yealink T53W",
            "deviceClass": "DeskPhone",
            "lineCount": 81,
            "addons": [
                {
                    "id": "11",
                    "name": "Yealink EXP50",
                    "count": 1
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-119-11-2",
        "skuId": "LC_HD_974",
        "type": "HardPhone",
        "model": {
            "id": "119",
            "name": "Yealink T53W",
            "deviceClass": "DeskPhone",
            "lineCount": 141,
            "addons": [
                {
                    "id": "11",
                    "name": "Yealink EXP50",
                    "count": 2
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-121",
        "skuId": "LC_HD_955",
        "type": "HardPhone",
        "model": {
            "id": "121",
            "name": "Yealink T54W",
            "deviceClass": "DeskPhone",
            "lineCount": 27,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-121-11-1",
        "skuId": "LC_HD_975",
        "type": "HardPhone",
        "model": {
            "id": "121",
            "name": "Yealink T54W",
            "deviceClass": "DeskPhone",
            "lineCount": 87,
            "addons": [
                {
                    "id": "11",
                    "name": "Yealink EXP50",
                    "count": 1
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-121-11-2",
        "skuId": "LC_HD_976",
        "type": "HardPhone",
        "model": {
            "id": "121",
            "name": "Yealink T54W",
            "deviceClass": "DeskPhone",
            "lineCount": 147,
            "addons": [
                {
                    "id": "11",
                    "name": "Yealink EXP50",
                    "count": 2
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-95",
        "skuId": "LC_HD_640",
        "type": "HardPhone",
        "model": {
            "id": "95",
            "name": "Yealink T57W",
            "deviceClass": "DeskPhone",
            "lineCount": 29,
            "addons": [],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-95-11-1",
        "skuId": "LC_HD_641",
        "type": "HardPhone",
        "model": {
            "id": "95",
            "name": "Yealink T57W",
            "deviceClass": "DeskPhone",
            "lineCount": 89,
            "addons": [
                {
                    "id": "11",
                    "name": "Yealink EXP50",
                    "count": 1
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-95-11-2",
        "skuId": "LC_HD_642",
        "type": "HardPhone",
        "model": {
            "id": "95",
            "name": "Yealink T57W",
            "deviceClass": "DeskPhone",
            "lineCount": 149,
            "addons": [
                {
                    "id": "11",
                    "name": "Yealink EXP50",
                    "count": 2
                }
            ],
            "features": [
                "Intercom",
                "Paging",
                "CommonPhone",
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-149-3-1",
        "skuId": "LC_HD_959",
        "type": "HardPhone",
        "model": {
            "id": "149",
            "name": "Yealink W76P Cordless Phone",
            "deviceClass": "CordlessPhone",
            "lineCount": 6,
            "addons": [
                {
                    "id": "3",
                    "name": "Yealink Handset",
                    "count": 1
                }
            ],
            "features": [
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-149-3-2",
        "skuId": "LC_HD_960",
        "type": "HardPhone",
        "model": {
            "id": "149",
            "name": "Yealink W76P Cordless Phone",
            "deviceClass": "CordlessPhone",
            "lineCount": 6,
            "addons": [
                {
                    "id": "3",
                    "name": "Yealink Handset",
                    "count": 2
                }
            ],
            "features": [
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-149-3-3",
        "skuId": "LC_HD_961",
        "type": "HardPhone",
        "model": {
            "id": "149",
            "name": "Yealink W76P Cordless Phone",
            "deviceClass": "CordlessPhone",
            "lineCount": 6,
            "addons": [
                {
                    "id": "3",
                    "name": "Yealink Handset",
                    "count": 3
                }
            ],
            "features": [
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-149-3-4",
        "skuId": "LC_HD_962",
        "type": "HardPhone",
        "model": {
            "id": "149",
            "name": "Yealink W76P Cordless Phone",
            "deviceClass": "CordlessPhone",
            "lineCount": 6,
            "addons": [
                {
                    "id": "3",
                    "name": "Yealink Handset",
                    "count": 4
                }
            ],
            "features": [
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-150-3-1",
        "skuId": "LC_HD_963",
        "type": "HardPhone",
        "model": {
            "id": "150",
            "name": "Yealink W79P Cordless Phone",
            "deviceClass": "CordlessPhone",
            "lineCount": 6,
            "addons": [
                {
                    "id": "3",
                    "name": "Yealink Handset",
                    "count": 1
                }
            ],
            "features": [
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-150-3-2",
        "skuId": "LC_HD_964",
        "type": "HardPhone",
        "model": {
            "id": "150",
            "name": "Yealink W79P Cordless Phone",
            "deviceClass": "CordlessPhone",
            "lineCount": 6,
            "addons": [
                {
                    "id": "3",
                    "name": "Yealink Handset",
                    "count": 2
                }
            ],
            "features": [
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-150-3-3",
        "skuId": "LC_HD_965",
        "type": "HardPhone",
        "model": {
            "id": "150",
            "name": "Yealink W79P Cordless Phone",
            "deviceClass": "CordlessPhone",
            "lineCount": 6,
            "addons": [
                {
                    "id": "3",
                    "name": "Yealink Handset",
                    "count": 3
                }
            ],
            "features": [
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    },
    {
        "sku": "HP-150-3-4",
        "skuId": "LC_HD_966",
        "type": "HardPhone",
        "model": {
            "id": "150",
            "name": "Yealink W79P Cordless Phone",
            "deviceClass": "CordlessPhone",
            "lineCount": 6,
            "addons": [
                {
                    "id": "3",
                    "name": "Yealink Handset",
                    "count": 4
                }
            ],
            "features": [
                "BLA",
                "HELD"
            ]
        },
        "countryId": 1,
        "assistedProvisioningCapability": "Disabled",
        "orderingCapability": "Enabled"
    }
]

const useDeviceDictionary = (postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const url = 'https://platform.ringcentral.com/restapi/v1.0/dictionary/device-catalog'
    const baseWaitingPeriod = 250

    const fetchDeviceDictionary = async () => {
        const accessToken = localStorage.getItem('cs_access_token')
        if (!accessToken) {
            throw new Error('No access token')
        }

        const devices = await getDevices(accessToken)
        return devices
    }

    const getDevices = async (token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            setTimeout(() => {
                return defaultDevices
            }, 5000)
            const response = await RestCentral.get(url, headers)
            const devices = response.data.records as Device[]
            
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
            return devices
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rale limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to get device dictionary`)
            console.log(e)
            postMessage(new Message(`Failed to get device dictionary ${e.error ?? ''}`, 'error'))
            postError(new SyncError('', 0, ['Failed to get device dictionary', ''], e.error ?? ''))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
            return defaultDevices as unknown[] as Device[]
        }
    }

    return {fetchDeviceDictionary}
}

export default useDeviceDictionary