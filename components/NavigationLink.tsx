import Link from "next/link";
import type { ComponentProps } from "react";
import { TICKET_SHOP_URL } from "@/data/ticketShop";

type Props = Pick<ComponentProps<"a">, "children" | "className" | "onClick"> & {
  href: string;
  replace?: boolean;
};

const ticketPaths = /^(?:https?:\/\/(?:www\.)?carnaval-radio\.nl)?\/(?:tickets|tickets-kopen|start-verkoop)\/?(?:[?#].*)?$/i;

export default function NavigationLink({ href, replace, ...props }: Props) {
  const destination = ticketPaths.test(href) ? TICKET_SHOP_URL : href;
  if (/^(?:https?:)?\/\//i.test(destination)) {
    return <a {...props} href={destination} target="_blank" rel="noopener noreferrer" />;
  }
  return <Link {...props} href={destination} replace={replace} />;
}
