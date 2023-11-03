import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip, TooltipProps } from 'antd';
import styles from './InfoTooltip.module.scss';

const InfoTooltip = (props: TooltipProps) => {
  return (
    <Tooltip overlayClassName="cs_info_tooltip" className={styles.info_tooltip} {...props}>
      <InfoCircleOutlined style={{ color: props.color }} />
    </Tooltip>
  );
};

export default InfoTooltip;
