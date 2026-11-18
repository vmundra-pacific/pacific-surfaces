/**
 * Our Story (/about): the milestones and the team, 2026-10-08.
 *
 * Milestones are the dates on record (memory: pacific-site-facts): founded
 * 2000 as Pacific Stones Pvt. Ltd. (owner, 2026-11-18); exports from 2011; Pacific Quartz Surfaces LLP
 * in 2018; the quartz-grit factory, now Pacific Mintek, in 2020; the
 * Bretonstone plant in 2023; the Poland warehouse in late 2024. The old
 * page's growth rate and "one of India's leading" lines are not repeated.
 *
 * The team is the old page's list, unchanged, with its photographs and the
 * LinkedIn profiles already confirmed.
 *
 * 2026-11-17 (owner): Vikram Singh is Business Head India; Satakshi
 * Rautaray joins the list as Business Head DACH & Benelux, her photograph
 * cropped to the same head-and-shoulders frame as the others.
 *
 * 2026-11-18 (owner): Rajani Somani, Marketing Director, after Varun
 * Somani; Saral Mundra, Business Head Mexico & Middle East, before
 * Paulina. The 2000 founding name is Pacific Stones Pvt. Ltd.
 */

export const MILESTONES = [
  {
    year: "2000",
    title: "Pacific Stones Pvt. Ltd.",
    body: "Founded as a natural stone business, supplying granite.",
  },
  {
    year: "2011",
    title: "Pacific Granites India Pvt. Ltd.",
    body: "Exports begin, with a gang-saw unit for processing granite.",
  },
  {
    year: "2018",
    title: "Pacific Quartz Surfaces LLP",
    body: "Pacific enters engineered quartz.",
  },
  {
    year: "2020",
    title: "Pacific Mintek",
    body: "A quartz-grit factory is acquired, bringing a key raw material in-house.",
  },
  {
    year: "2023",
    title: "Pacific Engineered Surfaces Pvt. Ltd.",
    body: "A state-of-the-art Bretonstone plant opens, with fully automated manufacturing.",
  },
  {
    year: "2024",
    title: "Pacific Polska",
    body: "A warehouse opens in Poland late in the year, closer to customers in Europe.",
  },
];

export const TEAM: {
  name: string;
  role: string;
  photo: string;
  linkedin?: string;
}[] = [
  {
    name: "Mohanlal Somani",
    role: "Chairman",
    photo: "/team/mohanlal-somani.jpg",
  },
  {
    name: "Varun Somani",
    role: "Managing Director",
    photo: "/team/varun-somani.jpg",
    linkedin: "https://www.linkedin.com/in/varunsomani-pacific/",
  },
  {
    name: "Rajani Somani",
    role: "Marketing Director",
    photo: "/team/rajani-somani.jpg",
  },
  {
    name: "Varun Mundra",
    role: "Director",
    photo: "/team/varun-mundra.jpg",
    linkedin: "https://www.linkedin.com/in/varun-mundra-ba4b9589/",
  },
  {
    name: "Anumuthan",
    role: "General Manager",
    photo: "/team/anumuthan.png",
    linkedin: "https://www.linkedin.com/in/anumuthan-anu-429951313/",
  },
  {
    name: "Abhijeet Mankotia",
    role: "VP, Global Sales",
    photo: "/team/abhijeet-mankotia.jpg",
    linkedin: "https://www.linkedin.com/in/abhijeet-mankotia-a7b849172/",
  },
  {
    name: "Anish Datta",
    role: "VP, Business Development",
    photo: "/team/anish-datta.jpg",
    linkedin: "https://www.linkedin.com/in/anish-datta-690161159/",
  },
  {
    name: "Vikram Singh",
    role: "Business Head India",
    photo: "/team/vikram-singh.jpg",
  },
  {
    name: "Saral Mundra",
    role: "Business Head Mexico & Middle East",
    photo: "/team/saral-mundra.jpg",
  },
  {
    name: "Paulina Popławska",
    role: "Director, Pacific Polska",
    photo: "/team/paulina-poplawska.jpg",
  },
  {
    name: "Nagesh P K",
    role: "Commercial Manager, Pacific Granites India",
    photo: "/team/nagesh-pk.jpg",
  },
  {
    name: "Marcin",
    role: "Business Development Consultant, Central and Eastern Europe",
    photo: "/team/marcin.png",
    linkedin: "https://www.linkedin.com/in/marcin-kołczynski-313b4114b",
  },
  {
    name: "Satakshi Rautaray",
    role: "Business Head DACH & Benelux",
    photo: "/team/satakshi-rautaray.png",
  },
];
