import {
  MdHome,
  MdError,
  MdPhoneEnabled,
  MdApi,
  MdAssignmentInd,
  MdMusicNote,
  MdBusiness,
} from "react-icons/md";

export const navBarData = [
  {
    text: "Home",
    src: "/",
    icon: <MdHome />,
  },
  {
    text: "Over ons",
    src: "/",
    icon: <MdError />,
  },
  {
    text: "Luisteren",
    src: "/",
    icon: <MdMusicNote />,
  },
  {
    text: "Sponsoren",
    src: "/sponsors",
    icon: <MdBusiness />,
  },
  {
    text: "Gastenboek",
    src: "/",
    icon: <MdAssignmentInd />,
  },
  {
    text: "Overig",
    src: "/",
    icon: <MdApi />,
  },
  {
    text: "Contact",
    src: "/pages/contact",
    icon: <MdPhoneEnabled />,
    className: "border-b",
  },
];
