import React from 'react';
import Heading from '@theme-original/Heading';
import DocVerification, {
  useDocVerification,
} from '@site/src/theme/DocItem/Verification';

export default function HeadingWithDocVerification(props) {
  const verification = useDocVerification();
  const heading = <Heading {...props} />;

  if (props.as !== 'h1' || !verification) {
    return heading;
  }

  return (
    <>
      {heading}
      <DocVerification verification={verification} />
    </>
  );
}