import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";

const convertBreadcrumb = (str: string) => {
  return str
    .replace(/-/g, " ")
    .replace(/oe/g, "ö")
    .replace(/ae/g, "ä")
    .replace(/ue/g, "ü")
    .toUpperCase();
};

type PathArray = {
  breadcrumb: string;
  href: string;
};

export const Breadcrumbs = () => {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState<PathArray[]>();

  useEffect(() => {
    if (router) {
      const linkPath = router.asPath.split("/");
      linkPath.shift();

      const pathArray = linkPath.map((path, i) => {
        return {
          breadcrumb: path,
          href: "/" + linkPath.slice(0, i + 1).join("/"),
        };
      });

      setBreadcrumbs(pathArray);
    }
  }, [router]);

  if (!breadcrumbs) {
    return null;
  }

  return (
    <MuiBreadcrumbs aria-label="breadcrumb">
      {breadcrumbs.map((breadcrumb, i) => {
        return (
          <Link key={breadcrumb.href} href={breadcrumb.href}>
            <a>{convertBreadcrumb(breadcrumb.breadcrumb)}</a>
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
