import React from 'react';
import clsx from 'clsx';

/**
 * Swizzled: mobile menu uses `<ul class="menu__list">`; default used `<div>` for HTML
 * items, which is invalid inside `<ul>` and can drop or misplace GitHub / custom HTML.
 */
export default function HtmlNavbarItem({
  value,
  className,
  mobile = false,
  isDropdownItem = false,
}) {
  const Comp = isDropdownItem ? 'li' : mobile ? 'li' : 'div';
  return (
    <Comp
      className={clsx(
        {
          navbar__item: !mobile && !isDropdownItem,
          'menu__list-item': mobile,
        },
        className,
      )}
      dangerouslySetInnerHTML={{__html: value}}
    />
  );
}
