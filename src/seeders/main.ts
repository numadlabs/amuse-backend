import { Insertable } from "kysely";
import { db } from "../utils/db";
import {
  Bonus,
  Card,
  Category,
  Country,
  Currency,
  Employee,
  Restaurant,
  Timetable,
  Transaction,
  User,
  UserTier,
} from "../types/db/types";
import logger from "../config/winston";
import { config } from "../config/config";

const country: Insertable<Country>[] = [
  { name: "Afghanistan", alpha3: "AFG", countryCode: "004" },
  { name: "Åland Islands", alpha3: "ALA", countryCode: "248" },
  { name: "Albania", alpha3: "ALB", countryCode: "008" },
  { name: "Algeria", alpha3: "DZA", countryCode: "012" },
  { name: "American Samoa", alpha3: "ASM", countryCode: "016" },
  { name: "Andorra", alpha3: "AND", countryCode: "020" },
  { name: "Angola", alpha3: "AGO", countryCode: "024" },
  { name: "Anguilla", alpha3: "AIA", countryCode: "660" },
  { name: "Antarctica", alpha3: "ATA", countryCode: "010" },
  { name: "Antigua and Barbuda", alpha3: "ATG", countryCode: "028" },
  { name: "Argentina", alpha3: "ARG", countryCode: "032" },
  { name: "Armenia", alpha3: "ARM", countryCode: "051" },
  { name: "Aruba", alpha3: "ABW", countryCode: "533" },
  { name: "Australia", alpha3: "AUS", countryCode: "036" },
  { name: "Austria", alpha3: "AUT", countryCode: "040" },
  { name: "Azerbaijan", alpha3: "AZE", countryCode: "031" },
  { name: "Bahamas", alpha3: "BHS", countryCode: "044" },
  { name: "Bahrain", alpha3: "BHR", countryCode: "048" },
  { name: "Bangladesh", alpha3: "BGD", countryCode: "050" },
  { name: "Barbados", alpha3: "BRB", countryCode: "052" },
  { name: "Belarus", alpha3: "BLR", countryCode: "112" },
  { name: "Belgium", alpha3: "BEL", countryCode: "056" },
  { name: "Belize", alpha3: "BLZ", countryCode: "084" },
  { name: "Benin", alpha3: "BEN", countryCode: "204" },
  { name: "Bermuda", alpha3: "BMU", countryCode: "060" },
  { name: "Bhutan", alpha3: "BTN", countryCode: "064" },
  {
    name: "Bolivia, Plurinational State of",
    alpha3: "BOL",
    countryCode: "068",
  },
  {
    name: "Bonaire, Sint Eustatius and Saba",
    alpha3: "BES",
    countryCode: "535",
  },
  { name: "Bosnia and Herzegovina", alpha3: "BIH", countryCode: "070" },
  { name: "Botswana", alpha3: "BWA", countryCode: "072" },
  { name: "Bouvet Island", alpha3: "BVT", countryCode: "074" },
  { name: "Brazil", alpha3: "BRA", countryCode: "076" },
  {
    name: "British Indian Ocean Territory",
    alpha3: "IOT",
    countryCode: "086",
  },
  { name: "Brunei Darussalam", alpha3: "BRN", countryCode: "096" },
  { name: "Bulgaria", alpha3: "BGR", countryCode: "100" },
  { name: "Burkina Faso", alpha3: "BFA", countryCode: "854" },
  { name: "Burundi", alpha3: "BDI", countryCode: "108" },
  { name: "Cabo Verde", alpha3: "CPV", countryCode: "132" },
  { name: "Cambodia", alpha3: "KHM", countryCode: "116" },
  { name: "Cameroon", alpha3: "CMR", countryCode: "120" },
  { name: "Canada", alpha3: "CAN", countryCode: "124" },
  { name: "Cayman Islands", alpha3: "CYM", countryCode: "136" },
  {
    name: "Central African Republic",
    alpha3: "CAF",
    countryCode: "140",
  },
  { name: "Chad", alpha3: "TCD", countryCode: "148" },
  { name: "Chile", alpha3: "CHL", countryCode: "152" },
  { name: "China", alpha3: "CHN", countryCode: "156" },
  { name: "Christmas Island", alpha3: "CXR", countryCode: "162" },
  {
    name: "Cocos (Keeling) Islands",
    alpha3: "CCK",
    countryCode: "166",
  },
  { name: "Colombia", alpha3: "COL", countryCode: "170" },
  { name: "Comoros", alpha3: "COM", countryCode: "174" },
  { name: "Congo", alpha3: "COG", countryCode: "178" },
  {
    name: "Congo, Democratic Republic of the",
    alpha3: "COD",
    countryCode: "180",
  },
  { name: "Cook Islands", alpha3: "COK", countryCode: "184" },
  { name: "Costa Rica", alpha3: "CRI", countryCode: "188" },
  { name: "Côte d'Ivoire", alpha3: "CIV", countryCode: "384" },
  { name: "Croatia", alpha3: "HRV", countryCode: "191" },
  { name: "Cuba", alpha3: "CUB", countryCode: "192" },
  { name: "Curaçao", alpha3: "CUW", countryCode: "531" },
  { name: "Cyprus", alpha3: "CYP", countryCode: "196" },
  { name: "Czechia", alpha3: "CZE", countryCode: "203" },
  { name: "Denmark", alpha3: "DNK", countryCode: "208" },
  { name: "Djibouti", alpha3: "DJI", countryCode: "262" },
  { name: "Dominica", alpha3: "DMA", countryCode: "212" },
  { name: "Dominican Republic", alpha3: "DOM", countryCode: "214" },
  { name: "Ecuador", alpha3: "ECU", countryCode: "218" },
  { name: "Egypt", alpha3: "EGY", countryCode: "818" },
  { name: "El Salvador", alpha3: "SLV", countryCode: "222" },
  { name: "Equatorial Guinea", alpha3: "GNQ", countryCode: "226" },
  { name: "Eritrea", alpha3: "ERI", countryCode: "232" },
  { name: "Estonia", alpha3: "EST", countryCode: "233" },
  { name: "Eswatini", alpha3: "SWZ", countryCode: "748" },
  { name: "Ethiopia", alpha3: "ETH", countryCode: "231" },
  {
    name: "Falkland Islands (Malvinas)",
    alpha3: "FLK",
    countryCode: "238",
  },
  { name: "Faroe Islands", alpha3: "FRO", countryCode: "234" },
  { name: "Fiji", alpha3: "FJI", countryCode: "242" },
  { name: "Finland", alpha3: "FIN", countryCode: "246" },
  { name: "France", alpha3: "FRA", countryCode: "250" },
  { name: "French Guiana", alpha3: "GUF", countryCode: "254" },
  { name: "French Polynesia", alpha3: "PYF", countryCode: "258" },
  {
    name: "French Southern Territories",
    alpha3: "ATF",
    countryCode: "260",
  },
  { name: "Gabon", alpha3: "GAB", countryCode: "266" },
  { name: "Gambia", alpha3: "GMB", countryCode: "270" },
  { name: "Georgia", alpha3: "GEO", countryCode: "268" },
  { name: "Germany", alpha3: "DEU", countryCode: "276" },
  { name: "Ghana", alpha3: "GHA", countryCode: "288" },
  { name: "Gibraltar", alpha3: "GIB", countryCode: "292" },
  { name: "Greece", alpha3: "GRC", countryCode: "300" },
  { name: "Greenland", alpha3: "GRL", countryCode: "304" },
  { name: "Grenada", alpha3: "GRD", countryCode: "308" },
  { name: "Guadeloupe", alpha3: "GLP", countryCode: "312" },
  { name: "Guam", alpha3: "GUM", countryCode: "316" },
  { name: "Guatemala", alpha3: "GTM", countryCode: "320" },
  { name: "Guernsey", alpha3: "GGY", countryCode: "831" },
  { name: "Guinea", alpha3: "GIN", countryCode: "324" },
  { name: "Guinea-Bissau", alpha3: "GNB", countryCode: "624" },
  { name: "Guyana", alpha3: "GUY", countryCode: "328" },
  { name: "Haiti", alpha3: "HTI", countryCode: "332" },
  {
    name: "Heard Island and McDonald Islands",
    alpha3: "HMD",
    countryCode: "334",
  },
  { name: "Holy See", alpha3: "VAT", countryCode: "336" },
  { name: "Honduras", alpha3: "HND", countryCode: "340" },
  { name: "Hong Kong", alpha3: "HKG", countryCode: "344" },
  { name: "Hungary", alpha3: "HUN", countryCode: "348" },
  { name: "Iceland", alpha3: "ISL", countryCode: "352" },
  { name: "India", alpha3: "IND", countryCode: "356" },
  { name: "Indonesia", alpha3: "IDN", countryCode: "360" },
  {
    name: "Iran, Islamic Republic of",
    alpha3: "IRN",
    countryCode: "364",
  },
  { name: "Iraq", alpha3: "IRQ", countryCode: "368" },
  { name: "Ireland", alpha3: "IRL", countryCode: "372" },
  { name: "Isle of Man", alpha3: "IMN", countryCode: "833" },
  { name: "Israel", alpha3: "ISR", countryCode: "376" },
  { name: "Italy", alpha3: "ITA", countryCode: "380" },
  { name: "Jamaica", alpha3: "JAM", countryCode: "388" },
  { name: "Japan", alpha3: "JPN", countryCode: "392" },
  { name: "Jersey", alpha3: "JEY", countryCode: "832" },
  { name: "Jordan", alpha3: "JOR", countryCode: "400" },
  { name: "Kazakhstan", alpha3: "KAZ", countryCode: "398" },
  { name: "Kenya", alpha3: "KEN", countryCode: "404" },
  { name: "Kiribati", alpha3: "KIR", countryCode: "296" },
  {
    name: "Korea, Democratic People's Republic of",
    alpha3: "PRK",
    countryCode: "408",
  },
  { name: "Korea, Republic of", alpha3: "KOR", countryCode: "410" },
  { name: "Kuwait", alpha3: "KWT", countryCode: "414" },
  { name: "Kyrgyzstan", alpha3: "KGZ", countryCode: "417" },
  {
    name: "Lao People's Democratic Republic",
    alpha3: "LAO",
    countryCode: "418",
  },
  { name: "Latvia", alpha3: "LVA", countryCode: "428" },
  { name: "Lebanon", alpha3: "LBN", countryCode: "422" },
  { name: "Lesotho", alpha3: "LSO", countryCode: "426" },
  { name: "Liberia", alpha3: "LBR", countryCode: "430" },
  { name: "Libya", alpha3: "LBY", countryCode: "434" },
  { name: "Liechtenstein", alpha3: "LIE", countryCode: "438" },
  { name: "Lithuania", alpha3: "LTU", countryCode: "440" },
  { name: "Luxembourg", alpha3: "LUX", countryCode: "442" },
  { name: "Macao", alpha3: "MAC", countryCode: "446" },
  { name: "Madagascar", alpha3: "MDG", countryCode: "450" },
  { name: "Malawi", alpha3: "MWI", countryCode: "454" },
  { name: "Malaysia", alpha3: "MYS", countryCode: "458" },
  { name: "Maldives", alpha3: "MDV", countryCode: "462" },
  { name: "Mali", alpha3: "MLI", countryCode: "466" },
  { name: "Malta", alpha3: "MLT", countryCode: "470" },
  { name: "Marshall Islands", alpha3: "MHL", countryCode: "584" },
  { name: "Martinique", alpha3: "MTQ", countryCode: "474" },
  { name: "Mauritania", alpha3: "MRT", countryCode: "478" },
  { name: "Mauritius", alpha3: "MUS", countryCode: "480" },
  { name: "Mayotte", alpha3: "MYT", countryCode: "175" },
  { name: "Mexico", alpha3: "MEX", countryCode: "484" },
  {
    name: "Micronesia, Federated States of",
    alpha3: "FSM",
    countryCode: "583",
  },
  { name: "Moldova, Republic of", alpha3: "MDA", countryCode: "498" },
  { name: "Monaco", alpha3: "MCO", countryCode: "492" },
  { name: "Mongolia", alpha3: "MNG", countryCode: "496" },
  { name: "Montenegro", alpha3: "MNE", countryCode: "499" },
  { name: "Montserrat", alpha3: "MSR", countryCode: "500" },
  { name: "Morocco", alpha3: "MAR", countryCode: "504" },
  { name: "Mozambique", alpha3: "MOZ", countryCode: "508" },
  { name: "Myanmar", alpha3: "MMR", countryCode: "104" },
  { name: "Namibia", alpha3: "NAM", countryCode: "516" },
  { name: "Nauru", alpha3: "NRU", countryCode: "520" },
  { name: "Nepal", alpha3: "NPL", countryCode: "524" },
  {
    name: "Netherlands, Kingdom of the",
    alpha3: "NLD",
    countryCode: "528",
  },
  { name: "New Caledonia", alpha3: "NCL", countryCode: "540" },
  { name: "New Zealand", alpha3: "NZL", countryCode: "554" },
  { name: "Nicaragua", alpha3: "NIC", countryCode: "558" },
  { name: "Niger", alpha3: "NER", countryCode: "562" },
  { name: "Nigeria", alpha3: "NGA", countryCode: "566" },
  { name: "Niue", alpha3: "NIU", countryCode: "570" },
  { name: "Norfolk Island", alpha3: "NFK", countryCode: "574" },
  { name: "North Macedonia", alpha3: "MKD", countryCode: "807" },
  {
    name: "Northern Mariana Islands",
    alpha3: "MNP",
    countryCode: "580",
  },
  { name: "Norway", alpha3: "NOR", countryCode: "578" },
  { name: "Oman", alpha3: "OMN", countryCode: "512" },
  { name: "Pakistan", alpha3: "PAK", countryCode: "586" },
  { name: "Palau", alpha3: "PLW", countryCode: "585" },
  { name: "Palestine, State of", alpha3: "PSE", countryCode: "275" },
  { name: "Panama", alpha3: "PAN", countryCode: "591" },
  { name: "Papua New Guinea", alpha3: "PNG", countryCode: "598" },
  { name: "Paraguay", alpha3: "PRY", countryCode: "600" },
  { name: "Peru", alpha3: "PER", countryCode: "604" },
  { name: "Philippines", alpha3: "PHL", countryCode: "608" },
  { name: "Pitcairn", alpha3: "PCN", countryCode: "612" },
  { name: "Poland", alpha3: "POL", countryCode: "616" },
  { name: "Portugal", alpha3: "PRT", countryCode: "620" },
  { name: "Puerto Rico", alpha3: "PRI", countryCode: "630" },
  { name: "Qatar", alpha3: "QAT", countryCode: "634" },
  { name: "Réunion", alpha3: "REU", countryCode: "638" },
  { name: "Romania", alpha3: "ROU", countryCode: "642" },
  { name: "Russian Federation", alpha3: "RUS", countryCode: "643" },
  { name: "Rwanda", alpha3: "RWA", countryCode: "646" },
  { name: "Saint Barthélemy", alpha3: "BLM", countryCode: "652" },
  {
    name: "Saint Helena, Ascension and Tristan da Cunha",
    alpha3: "SHN",
    countryCode: "654",
  },
  { name: "Saint Kitts and Nevis", alpha3: "KNA", countryCode: "659" },
  { name: "Saint Lucia", alpha3: "LCA", countryCode: "662" },
  {
    name: "Saint Martin (French part)",
    alpha3: "MAF",
    countryCode: "663",
  },
  {
    name: "Saint Pierre and Miquelon",
    alpha3: "SPM",
    countryCode: "666",
  },
  {
    name: "Saint Vincent and the Grenadines",
    alpha3: "VCT",
    countryCode: "670",
  },
  { name: "Samoa", alpha3: "WSM", countryCode: "882" },
  { name: "San Marino", alpha3: "SMR", countryCode: "674" },
  { name: "Sao Tome and Principe", alpha3: "STP", countryCode: "678" },
  { name: "Saudi Arabia", alpha3: "SAU", countryCode: "682" },
  { name: "Senegal", alpha3: "SEN", countryCode: "686" },
  { name: "Serbia", alpha3: "SRB", countryCode: "688" },
  { name: "Seychelles", alpha3: "SYC", countryCode: "690" },
  { name: "Sierra Leone", alpha3: "SLE", countryCode: "694" },
  { name: "Singapore", alpha3: "SGP", countryCode: "702" },
  {
    name: "Sint Maarten (Dutch part)",
    alpha3: "SXM",
    countryCode: "534",
  },
  { name: "Slovakia", alpha3: "SVK", countryCode: "703" },
  { name: "Slovenia", alpha3: "SVN", countryCode: "705" },
  { name: "Solomon Islands", alpha3: "SLB", countryCode: "090" },
  { name: "Somalia", alpha3: "SOM", countryCode: "706" },
  { name: "South Africa", alpha3: "ZAF", countryCode: "710" },
  {
    name: "South Georgia and the South Sandwich Islands",
    alpha3: "SGS",
    countryCode: "239",
  },
  { name: "South Sudan", alpha3: "SSD", countryCode: "728" },
  { name: "Spain", alpha3: "ESP", countryCode: "724" },
  { name: "Sri Lanka", alpha3: "LKA", countryCode: "144" },
  { name: "Sudan", alpha3: "SDN", countryCode: "729" },
  { name: "Suriname", alpha3: "SUR", countryCode: "740" },
  { name: "Svalbard and Jan Mayen", alpha3: "SJM", countryCode: "744" },
  { name: "Sweden", alpha3: "SWE", countryCode: "752" },
  { name: "Switzerland", alpha3: "CHE", countryCode: "756" },
  { name: "Syrian Arab Republic", alpha3: "SYR", countryCode: "760" },
  {
    name: "Taiwan, Province of China",
    alpha3: "TWN",
    countryCode: "158",
  },
  { name: "Tajikistan", alpha3: "TJK", countryCode: "762" },
  {
    name: "Tanzania, United Republic of",
    alpha3: "TZA",
    countryCode: "834",
  },
  { name: "Thailand", alpha3: "THA", countryCode: "764" },
  { name: "Timor-Leste", alpha3: "TLS", countryCode: "626" },
  { name: "Togo", alpha3: "TGO", countryCode: "768" },
  { name: "Tokelau", alpha3: "TKL", countryCode: "772" },
  { name: "Tonga", alpha3: "TON", countryCode: "776" },
  { name: "Trinidad and Tobago", alpha3: "TTO", countryCode: "780" },
  { name: "Tunisia", alpha3: "TUN", countryCode: "788" },
  { name: "Türkiye", alpha3: "TUR", countryCode: "792" },
  { name: "Turkmenistan", alpha3: "TKM", countryCode: "795" },
  {
    name: "Turks and Caicos Islands",
    alpha3: "TCA",
    countryCode: "796",
  },
  { name: "Tuvalu", alpha3: "TUV", countryCode: "798" },
  { name: "Uganda", alpha3: "UGA", countryCode: "800" },
  { name: "Ukraine", alpha3: "UKR", countryCode: "804" },
  { name: "United Arab Emirates", alpha3: "ARE", countryCode: "784" },
  {
    name: "United Kingdom of Great Britain and Northern Ireland",
    alpha3: "GBR",
    countryCode: "826",
  },
  {
    name: "United States of America",
    alpha3: "USA",
    countryCode: "840",
  },
  {
    name: "United States Minor Outlying Islands",
    alpha3: "UMI",
    countryCode: "581",
  },
  { name: "Uruguay", alpha3: "URY", countryCode: "858" },
  { name: "Uzbekistan", alpha3: "UZB", countryCode: "860" },
  { name: "Vanuatu", alpha3: "VUT", countryCode: "548" },
  {
    name: "Venezuela, Bolivarian Republic of",
    alpha3: "VEN",
    countryCode: "862",
  },
  { name: "Viet Nam", alpha3: "VNM", countryCode: "704" },
  {
    name: "Virgin Islands (British)",
    alpha3: "VGB",
    countryCode: "092",
  },
  { name: "Virgin Islands (U.S.)", alpha3: "VIR", countryCode: "850" },
  { name: "Wallis and Futuna", alpha3: "WLF", countryCode: "876" },
  { name: "Western Sahara", alpha3: "ESH", countryCode: "732" },
  { name: "Yemen", alpha3: "YEM", countryCode: "887" },
  { name: "Zambia", alpha3: "ZMB", countryCode: "894" },
  { name: "Zimbabwe", alpha3: "ZWE", countryCode: "716" },
];

const currency: Insertable<Currency>[] = [
  { ticker: "BTC", price: 60778.22672328948 },
  { ticker: "EUR", price: 0.9029 },
];

const user: Insertable<User>[] = [];

const userTier: Insertable<UserTier>[] = [
  {
    id: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
    name: "Bronze",
    requiredNo: 0,
    rewardMultiplier: 1,
    nextTierId: "2e992460-f6b2-410a-b0df-651ed9e91b02",
  },
  {
    id: "2e992460-f6b2-410a-b0df-651ed9e91b02",
    name: "Silver",
    requiredNo: 100,
    rewardMultiplier: 1.2,
    nextTierId: "180e74d7-da47-4531-aa27-4aceda0055c8",
  },
  {
    id: "180e74d7-da47-4531-aa27-4aceda0055c8",
    name: "Gold",
    requiredNo: 200,
    rewardMultiplier: 1.5,
  },
];

const category: Insertable<Category>[] = [
  {
    id: "2222b1cc-cffa-4e10-afbb-f02843bd306f",
    name: "Japanese",
  },
  {
    id: "00a9a914-54be-498c-a61e-dbb8919efde9",
    name: "Korean",
  },
  {
    id: "776f61b9-b2cc-48d6-a03b-53574b85bb4c",
    name: "Mediterranean",
  },
  {
    id: "570ac47e-f510-41e5-b261-c12f130d9580",
    name: "Buffet",
  },
  {
    id: "c7f541fc-2ec2-4f81-b158-4a10315398d4",
    name: "Fast Food",
  },
  {
    id: "a22d3e6e-3598-4cd1-b5da-2944c0a757b6",
    name: "Mongolian",
  },
  {
    id: "f4d83093-a32f-403c-8d1b-299ae5e53f72",
    name: "Pan-Asian",
  },
  {
    id: "ef18c860-255c-434d-85a6-5431b2180fc1",
    name: "Cafe",
  },
  {
    id: "b4574727-da9e-4b0e-8b02-5efd6b54ca40",
    name: "Lebanese",
  },
  {
    id: "5c64a1a3-e8bb-4264-b81f-773fb1ae86b7",
    name: "Beach Club",
  },
  {
    id: "96e93a58-216e-45d7-938b-4817d5ef9441",
    name: "Chinese",
  },
  {
    id: "1de944ee-6fdc-4ff8-8cb9-64b5d304c94d",
    name: "Georgian",
  },
  {
    id: "75e1e95e-a390-4f8f-8b03-a8143a81a016",
    name: "Cuban",
  },
  {
    id: "0400f3a9-3218-4fdb-ac5e-e2e690a8cb2b",
    name: "Mexican",
  },
  {
    id: "a60e9c84-ea9e-4b1b-b69f-bd8bb44d29d3",
    name: "Casual Dining",
  },
];

const restaurant: Insertable<Restaurant>[] = [
  {
    id: "fecc7b97-bdbb-4d37-9790-963a56e26490",
    name: "FAT CAT Downtown",
    description:
      "Experience the heart of Prague at FAT CAT Burgers & Craft Beer, where delicious gourmet burgers meet a curated selection of craft beers. Located in a lively, modern setting, it’s the perfect spot for a casual meal with friends or a night out. Come for the food, stay for the vibrant atmosphere.",
    location: "Václavské nám. 818 /45, 110 00 Nové Město, Czechia",
    googleMapsUrl:
      "https://www.google.com/maps/place/FAT+CAT+Downtown/@50.0811535,14.4207876,16z/data=!4m10!1m2!2m1!1sFAT+CAT!3m6!1s0x470b955b7e812c07:0x5d15b4ab301988cb!8m2!3d50.0811995!4d14.4285571!15sCgdGQVQgQ0FUWgkiB2ZhdCBjYXSSARRoYW1idXJnZXJfcmVzdGF1cmFudOABAA!16s%2Fg%2F11rsh51hd8?entry=ttu",
    latitude: 50.084178107862094,
    longitude: 14.424225962886798,
    balance: 0.054668,
    rewardAmount: 1,
    perkOccurence: 3,
    categoryId: "a60e9c84-ea9e-4b1b-b69f-bd8bb44d29d3",
    logo: "1714ebf9-a45a-4793-a7fc-86523815f7e6",
  },
];

const transaction: Insertable<Transaction>[] = [
  {
    type: "DEPOSIT",
    amount: 0.054668,
    txid: "3a0b28909a47b6421dc2ed486a7bc7b7555ee88a94373b629f7eee5043ab1718",
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
  },
];

const employee: Insertable<Employee>[] = [
  {
    role: "RESTAURANT_OWNER",
    email: "owner@fatcat.com",
    password: "$2a$10$PPHHrwYv0w81d/yhsVu0j.OF8o4y.YQ0fGDo5PL5RRmatr1lymr5y",
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
    isOnboarded: true,
  },
  {
    role: "RESTAURANT_MANAGER",
    email: "manager@fatcat.com",
    password: "$2a$10$PPHHrwYv0w81d/yhsVu0j.OF8o4y.YQ0fGDo5PL5RRmatr1lymr5y",
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
    isOnboarded: true,
  },
  {
    role: "RESTAURANT_WAITER",
    email: "staff@fatcat.com",
    password: "$2a$10$PPHHrwYv0w81d/yhsVu0j.OF8o4y.YQ0fGDo5PL5RRmatr1lymr5y",
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
    isOnboarded: true,
  },
];

const timetable: Insertable<Timetable>[] = [
  {
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
    dayNoOfTheWeek: 1,
    opensAt: "07:00",
    closesAt: "23:00",
  },
  {
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
    dayNoOfTheWeek: 2,
    opensAt: "07:00",
    closesAt: "23:00",
  },
  {
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
    dayNoOfTheWeek: 3,
    opensAt: "07:00",
    closesAt: "23:00",
  },
  {
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
    dayNoOfTheWeek: 4,
    opensAt: "07:00",
    closesAt: "23:00",
  },
  {
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
    dayNoOfTheWeek: 5,
    opensAt: "07:00",
    closesAt: "00:00",
  },
  {
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
    dayNoOfTheWeek: 6,
    opensAt: "07:00",
    closesAt: "00:00",
  },
  {
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
    dayNoOfTheWeek: 7,
    opensAt: "07:00",
    closesAt: "23:00",
  },
];

const card: Insertable<Card>[] = [
  {
    id: "d0c9ff27-88db-45e5-92dc-67917dd3d68f",
    nftUrl:
      "https://basescan.org/token/0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
    nftImageUrl: "6da21786-c93a-4b1a-bb44-921ed69a87eb",
    instruction:
      "Show your Amuse Bouche QR code to check in and unlock rewards with each visit.",
    benefits: "Earn Bitcoin for every visit.",
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
  },
];

// const bonus: Insertable<Bonus>[] = [
//   {
//     name: "Complimentary Dessert",
//     totalSupply: 50,
//     type: "RECURRING",
//     cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
//   },
//   {
//     name: "Exclusive Appetizer",
//     totalSupply: 50,
//     type: "RECURRING",
//     cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
//   },
//   {
//     name: "Weekly Wine Tasting",
//     totalSupply: 50,
//     type: "RECURRING",
//     cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
//   },
//   {
//     name: "House Special Drink",
//     totalSupply: 100,
//     price: 0.000014,
//     type: "REDEEMABLE",
//     cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
//   },
//   {
//     name: "Chef's Choice Starter",
//     totalSupply: 100,
//     price: 0.000014,
//     type: "REDEEMABLE",
//     cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
//   },
//   {
//     name: "Discounted Meal",
//     totalSupply: 100,
//     price: 0.000014,
//     type: "REDEEMABLE",
//     cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
//   },
//   {
//     name: "Priority Seating on Fridays",
//     totalSupply: 10,
//     visitNo: 15,
//     type: "SINGLE",
//     cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
//   },
//   {
//     name: "Private Dining Experience",
//     totalSupply: 10,
//     visitNo: 20,
//     type: "SINGLE",
//     cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
//   },
//   {
//     name: "Complimentary Chef's Special",
//     totalSupply: 10,
//     visitNo: 25,
//     type: "SINGLE",
//     cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
//   },
//   {
//     name: "Free Sushi Roll",
//     totalSupply: 50,
//     type: "RECURRING",
//     cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
//   },
//   {
//     name: "Complimentary Tea",
//     totalSupply: 50,
//     type: "RECURRING",
//     cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
//   },
//   {
//     name: "Seasonal Dessert",
//     totalSupply: 50,
//     type: "RECURRING",
//     cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
//   },
//   {
//     name: "Free Signature Cocktail",
//     totalSupply: 100,
//     price: 0.000014,
//     type: "REDEEMABLE",
//     cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
//   },
//   {
//     name: "Chef's Special Dish",
//     totalSupply: 100,
//     price: 0.000014,
//     type: "REDEEMABLE",
//     cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
//   },
//   {
//     name: "Discount on Next Visit",
//     totalSupply: 100,
//     price: 0.000014,
//     type: "REDEEMABLE",
//     cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
//   },
//   {
//     name: "VIP Table Reservation",
//     totalSupply: 10,
//     visitNo: 15,
//     type: "SINGLE",
//     cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
//   },
//   {
//     name: "Exclusive Tasting Menu",
//     totalSupply: 10,
//     visitNo: 20,
//     type: "SINGLE",
//     cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
//   },
//   {
//     name: "Special Chef's Dinner",
//     totalSupply: 10,
//     visitNo: 25,
//     type: "SINGLE",
//     cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
//   },
//   {
//     name: "Complimentary Coffee",
//     totalSupply: 50,
//     type: "RECURRING",
//     cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
//   },
//   {
//     name: "Free Pastry",
//     totalSupply: 50,
//     type: "RECURRING",
//     cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
//   },
//   {
//     name: "Unlimited Refills",
//     totalSupply: 50,
//     type: "RECURRING",
//     cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
//   },
//   {
//     name: "Discount on Beverages",
//     totalSupply: 100,
//     price: 0.000014,
//     type: "REDEEMABLE",
//     cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
//   },
//   {
//     name: "Complimentary Snack",
//     totalSupply: 100,
//     price: 0.000014,
//     type: "REDEEMABLE",
//     cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
//   },
//   {
//     name: "Special Discount Voucher",
//     totalSupply: 100,
//     price: 0.000014,
//     type: "REDEEMABLE",
//     cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
//   },
//   {
//     name: "Reserved Table for Two",
//     totalSupply: 10,
//     visitNo: 15,
//     type: "SINGLE",
//     cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
//   },
//   {
//     name: "Exclusive Event Invite",
//     totalSupply: 10,
//     visitNo: 20,
//     type: "SINGLE",
//     cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
//   },
//   {
//     name: "Complimentary Lunch",
//     totalSupply: 10,
//     visitNo: 25,
//     type: "SINGLE",
//     cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
//   },
//   {
//     name: "Free Espresso Shot",
//     totalSupply: 50,
//     type: "RECURRING",
//     cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
//   },
//   {
//     name: "Complimentary Muffin",
//     totalSupply: 50,
//     type: "RECURRING",
//     cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
//   },
//   {
//     name: "Daily Pastry Special",
//     totalSupply: 50,
//     type: "RECURRING",
//     cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
//   },
//   {
//     name: "Free Latte",
//     totalSupply: 100,
//     price: 0.000014,
//     type: "REDEEMABLE",
//     cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
//   },
//   {
//     name: "Complimentary Bagel",
//     totalSupply: 100,
//     price: 0.000014,
//     type: "REDEEMABLE",
//     cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
//   },
//   {
//     name: "Discount on Breakfast",
//     totalSupply: 100,
//     price: 0.000014,
//     type: "REDEEMABLE",
//     cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
//   },
//   {
//     name: "Reserved Corner Table",
//     totalSupply: 10,
//     visitNo: 15,
//     type: "SINGLE",
//     cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
//   },
//   {
//     name: "Special High Tea",
//     totalSupply: 10,
//     visitNo: 20,
//     type: "SINGLE",
//     cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
//   },
//   {
//     name: "Complimentary Brunch",
//     totalSupply: 10,
//     visitNo: 25,
//     type: "SINGLE",
//     cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
//   },
// ];

export async function insertSeed() {
  await db.deleteFrom("User").execute();
  await db.deleteFrom("Restaurant").execute();
  await db.deleteFrom("Country").execute();
  await db.deleteFrom("Currency").execute();
  await db.deleteFrom("UserTier").execute();
  await db.deleteFrom("Category").execute();
  await db.deleteFrom("Employee").execute();
  await db.deleteFrom("Timetable").execute();
  await db.deleteFrom("Card").execute();
  await db.deleteFrom("Bonus").execute();
  await db.deleteFrom("Transaction").execute();
  await db.selectFrom("Device").execute();
  await db.selectFrom("Category").execute();
  await db.selectFrom("EmailOtp").execute();
  await db.deleteFrom("BugReport").execute();
  await db.deleteFrom("Notification").execute();
  await db.deleteFrom("AuditTrail").execute();

  // for (let i = 1; i <= 100; i++) {
  //   user.push({
  //     email: `${i}@gmail.com`,
  //     password: "$2a$10$KEGOMfobWRqrUd5q0/GegutaDrsNgG46w1D5UYIfIpiormJ4dHzaq",
  //     userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  //     nickname: `#${i} tester`,
  //   });
  // }

  await db.insertInto("Country").values(country).returningAll().execute();
  await db.insertInto("Currency").values(currency).returningAll().execute();
  await db.insertInto("UserTier").values(userTier).returningAll().execute();
  // await db.insertInto("User").values(user).returningAll().execute();
  await db.insertInto("Category").values(category).returningAll().execute();
  await db.insertInto("Restaurant").values(restaurant).returningAll().execute();
  await db.insertInto("Employee").values(employee).returningAll().execute();
  await db.insertInto("Timetable").values(timetable).returningAll().execute();
  await db.insertInto("Card").values(card).returningAll().execute();
  // await db.insertInto("Bonus").values(bonus).returningAll().execute();
  await db
    .insertInto("Transaction")
    .values(transaction)
    .returningAll()
    .execute();
}

insertSeed().then(() =>
  logger.info(`Inserted seed data to DB: ${config.PGDATABASE}`)
);
