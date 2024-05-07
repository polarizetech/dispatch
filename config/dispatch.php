<?php

return [

    'supported_shipping_countries' => [
        'CA' => 'Canada',
        'US' => 'United States',
    ],

    'supported_weight_units' => ['lb', 'kg'],

    'supported_length_units' => ['in', 'cm'],

    // https://www.easypost.com/docs/api#carrier-metadata
    'easypost_shipping_carriers' => [
        'CanadaPost' => [
            'id' => 'ca_8eef23208afa469a9f29f4c222ea791c',
            'name' => 'Canada Post',
            'icon' => '/images/shipping-carriers/canadapost.svg',
            'supported_origins' => ['CA'],
            'supported_destinations' => [],
            'enabled' => true,
            'services' => [
                'RegularParcel',
                'ExpeditedParcel',
                'Xpresspost',
                'Priority',
                'ExpeditedParcelUSA',
                'SmallPacketUSAAir',
                'TrackedPacketUSA',
                'TrackedPacketUSALVM',
                'XpresspostUSA',
                'XpresspostInternational',
                'InternationalParcelAir',
                'InternationalParcelSurface',
                'SmallPacketInternationalAir',
                'SmallPacketInternationalSurface',
                'TrackedPacketInternational',
                'ExpeditedParcelPlus',
            ]
        ],
        'FedEx' => [
            'id' => 'ca_6cd6e704f6104a048df8182b14680f1a',
            'name' => 'FedEx',
            'icon' => '/images/shipping-carriers/fedex.svg',
            'supported_origins' => ['CA', 'US'],
            'supported_destinations' => [],
            'enabled' => true,
            'services' => [
                'FEDEX_2_DAY',
                'FEDEX_2_DAY_AM',
                'FEDEX_EXPRESS_SAVER',
                'FEDEX_GROUND',
                'FEDEX_INTERNATIONAL_CONNECT_PLUS',
                'FIRST_OVERNIGHT',
                'GROUND_HOME_DELIVERY',
                'INTERNATIONAL_ECONOMY',
                'INTERNATIONAL_FIRST',
                'INTERNATIONAL_PRIORITY',
                'PRIORITY_OVERNIGHT',
                'SMART_POST',
                'STANDARD_OVERNIGHT',
            ]
        ],
        'UPS' => [
            'id' => 'ca_feac6b4eec3c4f7dbd80cb8079e3b02d',
            'name' => 'UPS',
            'icon' => '/images/shipping-carriers/ups.svg',
            'supported_origins' => ['US'],
            'supported_destinations' => [],
            'enabled' => true,
            'services' => [
                'Ground',
                'UPSStandard',
                'UPSSaver',
                'Express',
                'ExpressPlus',
                'Expedited',
                'NextDayAir',
                'NextDayAirSaver',
                'NextDayAirEarlyAM',
                '2ndDayAir',
                '2ndDayAirAM',
                '3DaySelect',
            ]
        ],
        'USPS' => [
            'id' => 'ca_4fa26545dc084547b7bdbc32811914e8',
            'name' => 'USPS',
            'icon' => '/images/shipping-carriers/usps.svg',
            'supported_origins' => ['US'],
            'supported_destinations' => [],
            'enabled' => true,
            'services' => [
                'First',
                'Priority',
                'Express',
                'GroundAdvantage',
                'LibraryMail',
                'MediaMail',
                'FirstClassMailInternational',
                'FirstClassPackageInternationalService',
                'PriorityMailInternational',
                'ExpressMailInternational',
            ]
        ]
    ],

    // https://www.easypost.com/docs/api#test-tracking-codes
    'easypost_test_tracking_codes' => [
        'pre_transit' => 'EZ1000000001',
        'in_transit' => 'EZ2000000002',
        'out_for_delivery' => 'EZ3000000003',
        'delivered' => 'EZ4000000004',
        'return_to_sender' => 'EZ5000000005',
        'failure' => 'EZ6000000006',
        'unknown' => 'EZ7000000007',
    ],
];
