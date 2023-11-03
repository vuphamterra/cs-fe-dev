import { notification } from 'antd';
import React from 'react';
import SuccessIcon from '~/assets/images/fileManagement/ic_success.svg';
import ClosedIcon from '~/assets/images/fileManagement/closed.svg';
import './index.scss';
import ErrorIcon from '~/assets/images/fileManagement/ic_error.svg';
import WarningIcon from '~/assets/images/fileManagement/ic_warning.svg';

export default {
  success: ({
    message,
    description,
    ...props
  }: {
    message: React.ReactNode;
    description?: React.ReactNode;
  }) => {
    notification.success({
      message: <p className="titleNofi">{message}</p>,
      description: <p className="descriptionNofi">{description}</p>,
      icon: <img src={SuccessIcon as any} alt="icon" />,
      className: 'success',
      closeIcon: <img src={ClosedIcon as any} alt="icon" />,
      ...props,
    });
  },
  error: ({
    message,
    description,
    ...props
  }: {
    message: React.ReactNode;
    description: React.ReactNode;
  }) => {
    notification.error({
      message: <p className="titleNofi">{message}</p>,
      description: <p className="descriptionNofi">{description}</p>,
      icon: <img src={ErrorIcon as any} alt="icon" />,
      className: 'error',
      closeIcon: <img src={ClosedIcon as any} alt="icon" />,
      ...props,
    });
  },
  warning: ({
    message,
    description,
    ...props
  }: {
    message: React.ReactNode;
    description: React.ReactNode;
  }) => {
    notification.warning({
      message: <p className="titleNofi">{message}</p>,
      description: <p className="descriptionNofi">{description}</p>,
      icon: <img src={WarningIcon as any} alt="icon" />,
      className: 'warning',
      closeIcon: <img src={ClosedIcon as any} alt="icon" />,
      ...props,
    });
  },
};
