import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';

type Props = {
  overlayClassName?: string;
};

const LanguageDropdown = (props: Props) => {
  const { i18n, t } = useTranslation();

  const DROPDOWN_ITEMS = [
    {
      label: t('en_us'),
      key: 'en_us',
      icon: <span className="fi fi-us"></span>,
      alpha2code: 'us',
    },
    {
      label: t('vn'),
      key: 'vn',
      icon: <span className="fi fi-vn"></span>,
      alpha2code: 'vn',
    },
  ];

  const [selectedLng, setSelectedLng] = useState(DROPDOWN_ITEMS[0]);

  const dropdownChangeHandler: MenuProps['onClick'] = (e) => {
    i18n.changeLanguage(e.key);
    const selectedItem = DROPDOWN_ITEMS.find((item) => item.key === e.key);
    setSelectedLng(selectedItem);
  };

  const buttonClickHandler = () => {
    console.log('clicked!!!');
  };

  const menuProps = {
    items: DROPDOWN_ITEMS,
    onClick: dropdownChangeHandler,
  };

  return (
    <Dropdown.Button
      onClick={buttonClickHandler}
      overlayClassName={props.overlayClassName}
      menu={menuProps}
      icon={<span className={`fi fi-${selectedLng.alpha2code}`}></span>}
    >
      {t(selectedLng.key)}
    </Dropdown.Button>
  );
};

export default LanguageDropdown;
