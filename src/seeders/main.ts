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
  UserTier,
} from "../types/db/types";

const currency: Insertable<Currency>[] = [
  { ticker: "BTC", currentPrice: 64403 },
  { ticker: "EUR", currentPrice: 0.9178 },
];

const employee: Insertable<Employee>[] = [
  {
    id: "7a5758cf-58f5-49ce-98d3-a8fc9c4541ed",
    firstname: "super",
    lastname: "admin",
    role: "SUPER_ADMIN",
    email: "admin@mara.com",
    password: "$2b$10$dj1djRfiyHAojtEyXQV2UesGg2pwCntU/BoKP.7JV1wuhx9aQfMSu",
  },
];

const userTier: Insertable<UserTier>[] = [
  {
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
    id: "1d7d5b1f-f591-4dcd-af15-c5bebf40dac3",
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
    name: "Asia Asia",
    description:
      "The most awarded Pan Asian in the emirate, discover the flavours of the ancient Spice Route from the panoramic terrace.",
    location:
      "Dubai Marina Mall, 6th Floor, Pier 7 - Sheikh Zayed Rd - Dubai - United Arabic Emirates",
    latitude: 25.076123031600524,
    longitude: 55.13877820271325,
    rewardAmount: 1,
    perkOccurence: 3,
    categoryId: "f4d83093-a32f-403c-8d1b-299ae5e53f72",
    logo: "1-min.png",
  },
  {
    id: "22796677-67a8-452e-8e71-de3075b52c6c",
    name: "February 30",
    description:
      "Homegrown Beirut concept, February 30 makes its way to Dubai, setting its sights on the stunning location of Palm West beach at Palm Jumeirah.",
    location: "West beach Palm - Jumeirah - Dubai - United Arabic Emirates",
    latitude: 25.107418720651996,
    longitude: 55.14253997018007,
    rewardAmount: 3,
    perkOccurence: 5,
    categoryId: "5c64a1a3-e8bb-4264-b81f-773fb1ae86b7",
    logo: "2-min.png",
  },
];

const timetable: Insertable<Timetable>[] = [
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 1,
    opensAt: "10:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 2,
    opensAt: "10:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 3,
    opensAt: "10:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 4,
    opensAt: "10:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 5,
    opensAt: "10:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 6,
    opensAt: "10:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
    dayNoOfTheWeek: 7,
    isOffDay: true,
  },
  {
    restaurantId: "22796677-67a8-452e-8e71-de3075b52c6c",
    dayNoOfTheWeek: 1,
    opensAt: "10:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "22796677-67a8-452e-8e71-de3075b52c6c",
    dayNoOfTheWeek: 2,
    opensAt: "10:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "22796677-67a8-452e-8e71-de3075b52c6c",
    dayNoOfTheWeek: 3,
    opensAt: "10:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "22796677-67a8-452e-8e71-de3075b52c6c",
    dayNoOfTheWeek: 4,
    opensAt: "10:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "22796677-67a8-452e-8e71-de3075b52c6c",
    dayNoOfTheWeek: 5,
    opensAt: "10:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "22796677-67a8-452e-8e71-de3075b52c6c",
    dayNoOfTheWeek: 6,
    opensAt: "10:00",
    closesAt: "22:00",
  },
  {
    restaurantId: "22796677-67a8-452e-8e71-de3075b52c6c",
    dayNoOfTheWeek: 7,
    isOffDay: true,
  },
];

const card: Insertable<Card>[] = [
  {
    id: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
    nftUrl:
      "https://basescan.org/token/0x1dE409fC7613C234655f566A2969dD8a862E38B4?a=75127",
    nftImageUrl: "2nft-min.png",
    instruction:
      "Scan the Amuse Bouche QR code to check in and unlock rewards with each visit.",
    benefits: "Earn Bitcoin for every visit, complimentary bites along the way",
    restaurantId: "8cbfece9-bc33-4089-af7d-7a327a5e7faf",
  },
  {
    id: "84be08c7-c709-49d8-ad97-35648b974214",
    nftUrl:
      "https://basescan.org/token/0x1dE409fC7613C234655f566A2969dD8a862E38B4?a=75127",
    nftImageUrl: "1nft-min.png",
    instruction:
      "Scan the Amuse Bouche QR code to check in and unlock rewards with each visit.",
    benefits: "Earn Bitcoin for every visit, complimentary bites along the way",
    restaurantId: "22796677-67a8-452e-8e71-de3075b52c6c",
  },
];

const bonus: Insertable<Bonus>[] = [
  {
    name: "Free Dessert",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Free drink on the house",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Ribeye 15% off",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Free Dessert",
    totalSupply: 50,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Free drink on the house",
    totalSupply: 50,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Ribeye 15% off",
    totalSupply: 50,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Free Dessert",
    totalSupply: 50,
    visitNo: 5,
    type: "SINGLE",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Free drink on the house",
    totalSupply: 50,
    visitNo: 17,
    type: "SINGLE",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Ribeye 15% off",
    totalSupply: 50,
    visitNo: 44,
    type: "SINGLE",
    cardId: "90f7b8f7-b4e0-46b1-bd8f-95fb3374e2de",
  },
  {
    name: "Free Dessert",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "84be08c7-c709-49d8-ad97-35648b974214",
  },
  {
    name: "Free drink on the house",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "84be08c7-c709-49d8-ad97-35648b974214",
  },
  {
    name: "Ribeye 15% off",
    totalSupply: 50,
    type: "RECURRING",
    cardId: "84be08c7-c709-49d8-ad97-35648b974214",
  },
  {
    name: "Free Dessert",
    totalSupply: 50,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "84be08c7-c709-49d8-ad97-35648b974214",
  },
  {
    name: "Free drink on the house",
    totalSupply: 50,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "84be08c7-c709-49d8-ad97-35648b974214",
  },
  {
    name: "Ribeye 15% off",
    totalSupply: 50,
    price: 0.000014,
    type: "REDEEMABLE",
    cardId: "84be08c7-c709-49d8-ad97-35648b974214",
  },
  {
    name: "Free Dessert",
    totalSupply: 50,
    visitNo: 5,
    type: "SINGLE",
    cardId: "84be08c7-c709-49d8-ad97-35648b974214",
  },
  {
    name: "Free drink on the house",
    totalSupply: 50,
    visitNo: 17,
    type: "SINGLE",
    cardId: "84be08c7-c709-49d8-ad97-35648b974214",
  },
  {
    name: "Ribeye 15% off",
    totalSupply: 50,
    visitNo: 44,
    type: "SINGLE",
    cardId: "84be08c7-c709-49d8-ad97-35648b974214",
  },
];

export async function insertSeed() {
  await db.insertInto("Currency").values(currency).returningAll().execute();
  await db.insertInto("Employee").values(employee).returningAll().execute();
  await db.insertInto("UserTier").values(userTier).returningAll().execute();
  await db.insertInto("Category").values(category).returningAll().execute();
  await db.insertInto("Restaurant").values(restaurant).returningAll().execute();
  await db.insertInto("Timetable").values(timetable).returningAll().execute();
  await db.insertInto("Card").values(card).returningAll().execute();
  await db.insertInto("Bonus").values(bonus).returningAll().execute();
}
