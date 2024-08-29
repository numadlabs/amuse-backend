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

const user: Insertable<User>[] = [
  {
    id: "0c7e8a8b-81e2-4f43-9e58-dd972d551d0c",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:35.808Z",
    balance: 0.0,
    visitCount: 0,
    email: "1@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "58ba40c8-0ffb-46ee-965a-27583e726826",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:35.979Z",
    balance: 0.0,
    visitCount: 0,
    email: "2@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "6223c9f0-90ae-4e8e-8395-19fb5f84351d",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:36.101Z",
    balance: 0.0,
    visitCount: 0,
    email: "3@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "1d890e21-927f-476a-bfc0-c8349de07b21",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:36.223Z",
    balance: 0.0,
    visitCount: 0,
    email: "4@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "55e20404-f4a3-440a-a9bd-fa5ab245d6c5",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:36.359Z",
    balance: 0.0,
    visitCount: 0,
    email: "5@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "cc28b7bb-c183-466a-817b-1f45c1dd7594",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:36.483Z",
    balance: 0.0,
    visitCount: 0,
    email: "6@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "37d4b288-9451-4a3d-950d-ec59734e9ed3",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:36.607Z",
    balance: 0.0,
    visitCount: 0,
    email: "7@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "e98b78cd-1717-4fd0-be9f-5bcc89737854",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:36.729Z",
    balance: 0.0,
    visitCount: 0,
    email: "8@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "9fed645a-795d-430a-8429-51449ddeb7cf",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:36.854Z",
    balance: 0.0,
    visitCount: 0,
    email: "9@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "34772c16-0186-4ee4-86d9-a1f8ec6a89dc",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:36.976Z",
    balance: 0.0,
    visitCount: 0,
    email: "10@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "8347dafd-4a49-4e74-9f2e-cda4325eae40",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:37.101Z",
    balance: 0.0,
    visitCount: 0,
    email: "11@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "ba999f2e-6acc-423b-8c5e-aeff4db622a4",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:37.223Z",
    balance: 0.0,
    visitCount: 0,
    email: "12@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "41f0b72c-d56d-424f-ada1-e5a3d2c8f887",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:37.344Z",
    balance: 0.0,
    visitCount: 0,
    email: "13@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "c4e22f4d-3570-49f9-9a05-d5a7558b8a17",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:37.465Z",
    balance: 0.0,
    visitCount: 0,
    email: "14@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "5e891dea-0701-4068-aa4d-b8853f9ab596",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:37.585Z",
    balance: 0.0,
    visitCount: 0,
    email: "15@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "c58b6079-6ace-4708-a061-127f59eb2a9d",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:37.709Z",
    balance: 0.0,
    visitCount: 0,
    email: "16@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "692b8fa0-d684-4a29-bc35-d4d575ab99b9",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:37.829Z",
    balance: 0.0,
    visitCount: 0,
    email: "17@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "16b928d6-bd99-4387-82f8-1a3dda245703",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:37.950Z",
    balance: 0.0,
    visitCount: 0,
    email: "18@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "437b319d-f775-4f48-b15e-e3531b273051",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:38.071Z",
    balance: 0.0,
    visitCount: 0,
    email: "19@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
  {
    id: "00b0fbad-fb2b-4466-bec1-fde419ddd0bb",
    password: "Password12",
    nickname: "tester",
    role: "USER",
    profilePicture: null,
    dateOfBirth: null,
    location: null,
    createdAt: "2024-08-28T09:48:38.192Z",
    balance: 0.0,
    visitCount: 0,
    email: "20@gmail.com",
    userTierId: "b2207e15-18ca-4a90-9fd0-88186443f2bd",
  },
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
    balance: 0.05,
    rewardAmount: 1,
    perkOccurence: 3,
    categoryId: "a60e9c84-ea9e-4b1b-b69f-bd8bb44d29d3",
    logo: "1714ebf9-a45a-4793-a7fc-86523815f7e6",
  },
];

const transaction: Insertable<Transaction>[] = [
  {
    type: "DEPOSIT",
    amount: 0.05,
    txid: "3a0b28909a47b6421dc2ed486a7bc7b7555ee88a94373b629f7eee5043ab1718",
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
  },
];

const employee: Insertable<Employee>[] = [
  {
    fullname: "ADMIN",
    role: "SUPER_ADMIN",
    email: "admin@mara.com",
    password: "$2b$10$dj1djRfiyHAojtEyXQV2UesGg2pwCntU/BoKP.7JV1wuhx9aQfMSu",
    isOnboarded: true,
  },
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
  },
  {
    role: "RESTAURANT_WAITER",
    email: "waiter@fatcat.com",
    password: "$2a$10$PPHHrwYv0w81d/yhsVu0j.OF8o4y.YQ0fGDo5PL5RRmatr1lymr5y",
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
  },
  {
    role: "RESTAURANT_WAITER",
    email: "staff@fatcat.com",
    password: "$2a$10$PPHHrwYv0w81d/yhsVu0j.OF8o4y.YQ0fGDo5PL5RRmatr1lymr5y",
    restaurantId: "fecc7b97-bdbb-4d37-9790-963a56e26490",
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
      "https://basescan.org/token/0x1dE409fC7613C234655f566A2969dD8a862E38B4?a=75127",
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

  await db.insertInto("Currency").values(currency).returningAll().execute();
  await db.insertInto("UserTier").values(userTier).returningAll().execute();
  await db.insertInto("User").values(user).returningAll().execute();
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
