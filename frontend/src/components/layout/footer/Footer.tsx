import FooterIdobata from "./FooterIdobata";
import FooterDd2030 from "./FooterDd2030";
import FooterGeneral from "./FooterGeneral";

const Footer = () => {
  return (
    <footer className="flex flex-col items-center w-full bg-white rounded-t-[32px]">
      <FooterIdobata />
      <FooterDd2030 />
      <FooterGeneral />
    </footer>
  );
};

export default Footer;
