import Page from '#components/Page/Page';
import { useState } from 'react';
import style from './Profile.module.scss';
import MaterialSymbol from '#components/MaterialSymbol/MaterialSymbol';
import Input from '#components/Input/Input';
import Button from '#components/Button/Button';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [image, setImage] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && file.type.substring(0, 5) === 'image') {
      const reader = new FileReader();
      reader.onload = () => {
        const dataURL = reader.result as string;
        setImage(dataURL);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
    }
  };

  return (
    <Page>
      <div className={style.profileContainer}>
        <span className={style.profileText}>EDIT PROFILE</span>
        {image === null ? (
          <MaterialSymbol symbol='account_circle' class={style.profileIcon} />
        ) : (
          <img src={image} alt='avatar' className={style.profileAvatar} />
        )}
        <form className={style.profileForm} action='' id='profileform'>
          <Input type='file' accept='image/*' onChange={handleImageChange} />
          <Input placeholder='new username' type='username' />
          <Input placeholder='new email' type='email' />
          <Input placeholder='new password' type='password' />
          <Input placeholder='repeat new password' type='password' />
          <Button
            form='loginform'
            type='submit'
            className={style.profileButton}>
            SUBMIT
          </Button>
        </form>
      </div>
    </Page>
  );
};

export default Profile;
