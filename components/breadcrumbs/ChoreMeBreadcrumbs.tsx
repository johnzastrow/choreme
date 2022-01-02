import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";
import { useSession } from "next-auth/react";

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

const parentPaths: PathArray[] = [
  {
    breadcrumb: "Totals",
    href: "/parent",
  },
  {
    breadcrumb: "Assigned",
    href: "/parent/assigned-chores",
  },
  {
    breadcrumb: "Rewards",
    href: "/parent/rewards",
  },
  {
    breadcrumb: "Chore",
    href: "/parent/chores",
  },
];

const childrenPaths: PathArray[] = [
  {
    breadcrumb: "Chores",
    href: "/children",
  },
  {
    breadcrumb: "Rewards",
    href: "/children/rewards",
  },
];

export const ChoreMeBreadcrumbs = () => {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState<PathArray[]>();
  const session = useSession();
  const [paths, setPaths] = useState<PathArray[]>();

  useEffect(() => {
    if (session && session.data && session.data.role === "parent") {
      setPaths(parentPaths);
    } else {
      setPaths(childrenPaths);
    }
  }, [session]);

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
      {paths?.map((breadcrumb, i) => {
        return (
          <Link key={breadcrumb.href} href={breadcrumb.href}>
            <a
              style={{
                fontWeight:
                  router.asPath === breadcrumb.href ? "bold" : "normal",
              }}
            >
              {convertBreadcrumb(breadcrumb.breadcrumb)}
            </a>
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default ChoreMeBreadcrumbs;
