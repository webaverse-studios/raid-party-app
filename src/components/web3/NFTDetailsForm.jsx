import React, {useEffect, useState} from 'react';
import CustomButton from '../general/custom-button';

import styles from './nft-details-form.module.css';

export default function NFTDetailsForm({
  initialName = '',
  initialDetails = '',
  previewImage,
  refreshPreview,
  onChange = () => {},
}) {
  const [name, setName] = useState(initialName);
  const [details, setDetails] = useState(initialDetails);

  useEffect(() => {
    onChange({name, details});
  }, [name, details, onChange]);
  useEffect(() => {
    setName('');
    setDetails('');
  }, [previewImage]);

  return (
    <div className={styles.detailsForm}>
      <div className={styles.form}>
        <label htmlFor="name">
          <span>Name:</span>
        </label>
        <input
          type="text"
          name="name"
          placeholder={initialName}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <br />
        <label htmlFor="details">
          <span>Details:</span>
        </label>
        <input
          type="text"
          name="details"
          placeholder={initialDetails}
          value={details}
          onChange={e => setDetails(e.target.value)}
        />
        <CustomButton
          theme="dark"
          text="Refresh Thumbnail"
          size={12}
          className={styles.refButton}
          onClick={refreshPreview}
        />
      </div>
      {previewImage && (
        <div className={styles.preview}>
          <img crossOrigin="true" src={previewImage} />
        </div>
      )}
    </div>
  );
}
