import { Insertable } from "kysely";
import { db } from "../utils/db";
import {
  Bonus,
  Card,
  Category,
  Currency,
  Employee,
  Restaurant,
  Timetable,
  Transaction,
  User,
  UserTier,
} from "../types/db/types";

const currency: Insertable<Currency>[] = [
  { ticker: "BTC", price: 64403 },
  { ticker: "EUR", price: 0.9178 },
];

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

const user: Insertable<User> = {
  nickname: "gombochir",
  prefix: "976",
  telNumber: "99090280",
  password: "$2b$10$dj1djRfiyHAojtEyXQV2UesGg2pwCntU/BoKP.7JV1wuhx9aQfMSu",
  userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
};

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
];

const restaurant: Insertable<Restaurant>[] = [
  {
    id: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    name: "Sasazu",
    description:
      "A renowned Pan-Asian restaurant offering a fusion of flavors in a vibrant atmosphere.",
    location: "Bubenské nábř. 306, 170 04 Praha 7-Holešovice, Czechia",
    latitude: 50.100578,
    longitude: 14.438367,
    balance: 1,
    rewardAmount: 1,
    perkOccurence: 3,
    categoryId: "f4d83093-a32f-403c-8d1b-299ae5e53f72",
    logo: "51704aa1-2a1e-4c5f-a3d1-99063d2cf453",
  },
  {
    id: "34dbdac2-05f8-426e-926a-1983f3b9f144",
    name: "Sansho",
    description:
      "Modern Asian cuisine using fresh, seasonal ingredients, blending traditional and contemporary flavors.",
    location: "Petrská 25, 110 00 Praha 1-Nové Město, Czechia",
    latitude: 50.092205,
    longitude: 14.431995,
    balance: 1,
    rewardAmount: 2,
    perkOccurence: 5,
    categoryId: "f4d83093-a32f-403c-8d1b-299ae5e53f72",
    logo: "534889fc-b663-4636-954e-04d9900baf79",
  },
  {
    id: "ac9d78f5-4c18-418e-928e-162457adf328",
    name: "Kro Kitchen",
    description:
      "A contemporary restaurant offering a variety of dishes with a focus on quality ingredients and innovative cooking techniques.",
    location: "Štítného 202/35, 130 00 Praha 3-Žižkov, Czechia",
    latitude: 50.08635,
    longitude: 14.448378,
    balance: 1,
    rewardAmount: 3,
    perkOccurence: 7,
    categoryId: "00a9a914-54be-498c-a61e-dbb8919efde9",
    logo: "227307e6-b0df-4bf0-86ad-035866967114",
  },
  {
    id: "1d7d5b1f-f591-4dcd-af15-c5bebf40dac3",
    name: "Cafe Louvre",
    description:
      "An iconic cafe in Prague, offering a cozy atmosphere with a wide selection of coffee, pastries, and light meals.",
    location: "Národní 22, 110 00 Praha 1-Nové Město, Czechia",
    latitude: 50.082739,
    longitude: 14.419586,
    balance: 1,
    rewardAmount: 5,
    perkOccurence: 10,
    categoryId: "ef18c860-255c-434d-85a6-5431b2180fc1",
    logo: "4eb16d9b-d2f8-47a4-9c3f-e9e673130684",
  },
];

const transaction: Insertable<Transaction>[] = [
  {
    type: "DEPOSIT",
    amount: 1,
    txid: "3a0b28909a47b6421dc2ed486a7bc7b7555ee88a94373b629f7eee5043ab1718",
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
  },
  {
    type: "DEPOSIT",
    amount: 1,
    txid: "472a870f066f9c455d03b512e6d52a6dd423905dff6a31ee9390ffe47a4782a3",
    restaurantId: "34dbdac2-05f8-426e-926a-1983f3b9f144",
  },
  {
    type: "DEPOSIT",
    amount: 1,
    txid: "9db2e85e69bab802b7e5f6ca29da9e163b84a4bd77b2eef9e2327f342d5d1aef",
    restaurantId: "ac9d78f5-4c18-418e-928e-162457adf328",
  },
  {
    type: "DEPOSIT",
    amount: 1,
    txid: "8d5381ca891816279858e7a0ae6b2348f55eb908f57f76b568e30fffae6a7dad",
    restaurantId: "1d7d5b1f-f591-4dcd-af15-c5bebf40dac3",
  },
];

const employee: Insertable<Employee>[] = [
  {
    firstname: "super",
    lastname: "admin",
    role: "SUPER_ADMIN",
    email: "admin@mara.com",
    password: "$2b$10$dj1djRfiyHAojtEyXQV2UesGg2pwCntU/BoKP.7JV1wuhx9aQfMSu",
  },
  {
    firstname: "sasazu",
    lastname: "owner",
    role: "RESTAURANT_OWNER",
    email: "owner@sasazu.com",
    password: "$2b$10$UaHxXjkleWhQZpHdNFPJ0.jylGtOAUE6nxs/RigdndMVwEnaMejGG",
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
  },
  {
    firstname: "sasazu",
    lastname: "waiter",
    role: "RESTAURANT_WAITER",
    email: "waiter@sasazu.com",
    password: "$2a$10$TzTO0dXIi.dnngNCmfo.ger0VVOBtol9VyCX7CLHIzCL.qHSRfH22",
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
  },
  {
    firstname: "sansho",
    lastname: "owner",
    role: "RESTAURANT_OWNER",
    email: "owner@sansho.com",
    password: "$2b$10$UaHxXjkleWhQZpHdNFPJ0.jylGtOAUE6nxs/RigdndMVwEnaMejGG",
    restaurantId: "34dbdac2-05f8-426e-926a-1983f3b9f144",
  },
  {
    firstname: "sansho",
    lastname: "waiter",
    role: "RESTAURANT_WAITER",
    email: "waiter@sansho.com",
    password: "$2a$10$TzTO0dXIi.dnngNCmfo.ger0VVOBtol9VyCX7CLHIzCL.qHSRfH22",
    restaurantId: "34dbdac2-05f8-426e-926a-1983f3b9f144",
  },
  {
    firstname: "kro",
    lastname: "owner",
    role: "RESTAURANT_OWNER",
    email: "owner@kro.com",
    password: "$2b$10$UaHxXjkleWhQZpHdNFPJ0.jylGtOAUE6nxs/RigdndMVwEnaMejGG",
    restaurantId: "ac9d78f5-4c18-418e-928e-162457adf328",
  },
  {
    firstname: "kro",
    lastname: "waiter",
    role: "RESTAURANT_WAITER",
    email: "waiter@kro.com",
    password: "$2a$10$TzTO0dXIi.dnngNCmfo.ger0VVOBtol9VyCX7CLHIzCL.qHSRfH22",
    restaurantId: "ac9d78f5-4c18-418e-928e-162457adf328",
  },
  {
    firstname: "louvre",
    lastname: "owner",
    role: "RESTAURANT_OWNER",
    email: "owner@louvre.com",
    password: "$2b$10$UaHxXjkleWhQZpHdNFPJ0.jylGtOAUE6nxs/RigdndMVwEnaMejGG",
    restaurantId: "1d7d5b1f-f591-4dcd-af15-c5bebf40dac3",
  },
  {
    firstname: "louvre",
    lastname: "waiter",
    role: "RESTAURANT_WAITER",
    email: "waiter@louvre.com",
    password: "$2a$10$TzTO0dXIi.dnngNCmfo.ger0VVOBtol9VyCX7CLHIzCL.qHSRfH22",
    restaurantId: "1d7d5b1f-f591-4dcd-af15-c5bebf40dac3",
  },
];

const timetable: Insertable<Timetable>[] = [
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 1,
    opensAt: "11:30",
    closesAt: "23:00",
  },
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 2,
    opensAt: "11:30",
    closesAt: "23:00",
  },
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 3,
    opensAt: "11:30",
    closesAt: "23:00",
  },
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 4,
    opensAt: "11:30",
    closesAt: "23:00",
  },
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 5,
    opensAt: "11:30",
    closesAt: "00:00",
  },
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 6,
    opensAt: "11:30",
    closesAt: "00:00",
  },
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 7,
    opensAt: "11:30",
    closesAt: "23:00",
  },
  {
    restaurantId: "34dbdac2-05f8-426e-926a-1983f3b9f144",
    dayNoOfTheWeek: 1,
    opensAt: "12:00",
    closesAt: "22:30",
  },
  {
    restaurantId: "34dbdac2-05f8-426e-926a-1983f3b9f144",
    dayNoOfTheWeek: 2,
    opensAt: "12:00",
    closesAt: "22:30",
  },
  {
    restaurantId: "34dbdac2-05f8-426e-926a-1983f3b9f144",
    dayNoOfTheWeek: 3,
    opensAt: "12:00",
    closesAt: "22:30",
  },
  {
    restaurantId: "34dbdac2-05f8-426e-926a-1983f3b9f144",
    dayNoOfTheWeek: 4,
    opensAt: "12:00",
    closesAt: "22:30",
  },
  {
    restaurantId: "34dbdac2-05f8-426e-926a-1983f3b9f144",
    dayNoOfTheWeek: 5,
    opensAt: "12:00",
    closesAt: "23:00",
  },
  {
    restaurantId: "34dbdac2-05f8-426e-926a-1983f3b9f144",
    dayNoOfTheWeek: 6,
    opensAt: "12:00",
    closesAt: "23:00",
  },
  {
    restaurantId: "34dbdac2-05f8-426e-926a-1983f3b9f144",
    dayNoOfTheWeek: 7,
    isOffDay: true,
  },
  {
    restaurantId: "ac9d78f5-4c18-418e-928e-162457adf328",
    dayNoOfTheWeek: 1,
    opensAt: "11:00",
    closesAt: "21:00",
  },
  {
    restaurantId: "ac9d78f5-4c18-418e-928e-162457adf328",
    dayNoOfTheWeek: 2,
    opensAt: "11:00",
    closesAt: "21:00",
  },
  {
    restaurantId: "ac9d78f5-4c18-418e-928e-162457adf328",
    dayNoOfTheWeek: 3,
    opensAt: "11:00",
    closesAt: "21:00",
  },
  {
    restaurantId: "ac9d78f5-4c18-418e-928e-162457adf328",
    dayNoOfTheWeek: 4,
    opensAt: "11:00",
    closesAt: "21:00",
  },
  {
    restaurantId: "ac9d78f5-4c18-418e-928e-162457adf328",
    dayNoOfTheWeek: 5,
    opensAt: "11:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "ac9d78f5-4c18-418e-928e-162457adf328",
    dayNoOfTheWeek: 6,
    opensAt: "11:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "ac9d78f5-4c18-418e-928e-162457adf328",
    dayNoOfTheWeek: 7,
    opensAt: "11:00",
    closesAt: "21:00",
  },
  {
    restaurantId: "1d7d5b1f-f591-4dcd-af15-c5bebf40dac3",
    dayNoOfTheWeek: 1,
    opensAt: "08:00",
    closesAt: "23:30",
  },
  {
    restaurantId: "1d7d5b1f-f591-4dcd-af15-c5bebf40dac3",
    dayNoOfTheWeek: 2,
    opensAt: "08:00",
    closesAt: "23:30",
  },
  {
    restaurantId: "1d7d5b1f-f591-4dcd-af15-c5bebf40dac3",
    dayNoOfTheWeek: 3,
    opensAt: "08:00",
    closesAt: "23:30",
  },
  {
    restaurantId: "1d7d5b1f-f591-4dcd-af15-c5bebf40dac3",
    dayNoOfTheWeek: 4,
    opensAt: "08:00",
    closesAt: "23:30",
  },
  {
    restaurantId: "1d7d5b1f-f591-4dcd-af15-c5bebf40dac3",
    dayNoOfTheWeek: 5,
    opensAt: "08:00",
    closesAt: "23:30",
  },
  {
    restaurantId: "1d7d5b1f-f591-4dcd-af15-c5bebf40dac3",
    dayNoOfTheWeek: 6,
    opensAt: "08:00",
    closesAt: "23:30",
  },
  {
    restaurantId: "1d7d5b1f-f591-4dcd-af15-c5bebf40dac3",
    dayNoOfTheWeek: 7,
    opensAt: "08:00",
    closesAt: "23:30",
  },
];

const card: Insertable<Card>[] = [
  {
    id: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
    nftUrl:
      "https://basescan.org/token/0x1dE409fC7613C234655f566A2969dD8a862E38B4?a=75127",
    nftImageUrl: "7518f906-c8de-4250-b365-4eae551fb13a",
    instruction:
      "Scan the Amuse Bouche QR code to check in and unlock rewards with each visit.",
    benefits: "Earn Bitcoin for every visit, complimentary bites along the way",
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
  },
  {
    id: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
    nftUrl:
      "https://basescan.org/token/0x1dE409fC7613C234655f566A2969dD8a862E38B4?a=75128",
    nftImageUrl: "10c47db5-1218-4400-a693-e67fe14ded3a",
    instruction:
      "Scan the Amuse Bouche QR code to check in and unlock rewards with each visit.",
    benefits: "Earn Bitcoin for every visit, complimentary bites along the way",
    restaurantId: "34dbdac2-05f8-426e-926a-1983f3b9f144",
  },
  {
    id: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
    nftUrl:
      "https://basescan.org/token/0x1dE409fC7613C234655f566A2969dD8a862E38B4?a=75129",
    nftImageUrl: "e96d91c3-e215-454e-b1fe-a9898f7a2586",
    instruction:
      "Scan the Amuse Bouche QR code to check in and unlock rewards with each visit.",
    benefits: "Earn Bitcoin for every visit, complimentary bites along the way",
    restaurantId: "ac9d78f5-4c18-418e-928e-162457adf328",
  },
  {
    id: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
    nftUrl:
      "https://basescan.org/token/0x1dE409fC7613C234655f566A2969dD8a862E38B4?a=75130",
    nftImageUrl: "a6310d4e-b28e-4b45-911a-0ab6623c55ac",
    instruction:
      "Scan the Amuse Bouche QR code to check in and unlock rewards with each visit.",
    benefits: "Earn Bitcoin for every visit, complimentary bites along the way",
    restaurantId: "1d7d5b1f-f591-4dcd-af15-c5bebf40dac3",
  },
];

const bonus: Insertable<Bonus>[] = [
  {
    name: "Complimentary Dessert",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Exclusive Appetizer",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Weekly Wine Tasting",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "House Special Drink",
    totalSupply: 100,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Chef's Choice Starter",
    totalSupply: 100,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Discounted Meal",
    totalSupply: 100,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Priority Seating on Fridays",
    totalSupply: 10,
    visitNo: 15,
    type: "SINGLE",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Private Dining Experience",
    totalSupply: 10,
    visitNo: 20,
    type: "SINGLE",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Complimentary Chef's Special",
    totalSupply: 10,
    visitNo: 25,
    type: "SINGLE",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Free Sushi Roll",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
  },
  {
    name: "Complimentary Tea",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
  },
  {
    name: "Seasonal Dessert",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
  },
  {
    name: "Free Signature Cocktail",
    totalSupply: 100,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
  },
  {
    name: "Chef's Special Dish",
    totalSupply: 100,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
  },
  {
    name: "Discount on Next Visit",
    totalSupply: 100,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
  },
  {
    name: "VIP Table Reservation",
    totalSupply: 10,
    visitNo: 15,
    type: "SINGLE",
    cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
  },
  {
    name: "Exclusive Tasting Menu",
    totalSupply: 10,
    visitNo: 20,
    type: "SINGLE",
    cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
  },
  {
    name: "Special Chef's Dinner",
    totalSupply: 10,
    visitNo: 25,
    type: "SINGLE",
    cardId: "d3fcb8a8-4a8f-4e4b-82b5-9ad8d5e8c9c1",
  },
  {
    name: "Complimentary Coffee",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
  },
  {
    name: "Free Pastry",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
  },
  {
    name: "Unlimited Refills",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
  },
  {
    name: "Discount on Beverages",
    totalSupply: 100,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
  },
  {
    name: "Complimentary Snack",
    totalSupply: 100,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
  },
  {
    name: "Special Discount Voucher",
    totalSupply: 100,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
  },
  {
    name: "Reserved Table for Two",
    totalSupply: 10,
    visitNo: 15,
    type: "SINGLE",
    cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
  },
  {
    name: "Exclusive Event Invite",
    totalSupply: 10,
    visitNo: 20,
    type: "SINGLE",
    cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
  },
  {
    name: "Complimentary Lunch",
    totalSupply: 10,
    visitNo: 25,
    type: "SINGLE",
    cardId: "e2fbcd8e-83ff-41d4-b0d3-2b4c6e5b73fa",
  },
  {
    name: "Free Espresso Shot",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
  },
  {
    name: "Complimentary Muffin",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
  },
  {
    name: "Daily Pastry Special",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
  },
  {
    name: "Free Latte",
    totalSupply: 100,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
  },
  {
    name: "Complimentary Bagel",
    totalSupply: 100,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
  },
  {
    name: "Discount on Breakfast",
    totalSupply: 100,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
  },
  {
    name: "Reserved Corner Table",
    totalSupply: 10,
    visitNo: 15,
    type: "SINGLE",
    cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
  },
  {
    name: "Special High Tea",
    totalSupply: 10,
    visitNo: 20,
    type: "SINGLE",
    cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
  },
  {
    name: "Complimentary Brunch",
    totalSupply: 10,
    visitNo: 25,
    type: "SINGLE",
    cardId: "3b9d8e12-16e4-4263-8f8d-83e4d7d593ef",
  },
];

export async function insertSeed() {
  await db.deleteFrom("User").execute();
  await db.deleteFrom("Restaurant").execute();
  await db.deleteFrom("Currency").execute();
  await db.deleteFrom("UserTier").execute();
  await db.deleteFrom("Category").execute();
  await db.deleteFrom("Employee").execute();
  await db.deleteFrom("Timetable").execute();
  await db.deleteFrom("Card").execute();
  await db.deleteFrom("Bonus").execute();
  await db.deleteFrom("Transaction").execute();

  await db.insertInto("Currency").values(currency).returningAll().execute();
  await db.insertInto("UserTier").values(userTier).returningAll().execute();
  await db.insertInto("User").values(user).returningAll().execute();
  await db.insertInto("Category").values(category).returningAll().execute();
  await db.insertInto("Restaurant").values(restaurant).returningAll().execute();
  await db.insertInto("Employee").values(employee).returningAll().execute();
  await db.insertInto("Timetable").values(timetable).returningAll().execute();
  await db.insertInto("Card").values(card).returningAll().execute();
  await db.insertInto("Bonus").values(bonus).returningAll().execute();
  await db
    .insertInto("Transaction")
    .values(transaction)
    .returningAll()
    .execute();
}
