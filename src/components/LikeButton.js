import React, { useState } from 'react';
import "../css/LikeButton.scss";
function LikeButton() {
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);  //condition for if liked, it looks different
    return (
       <button
          className={`like-button ${liked ? 'liked' : ''}`}
          onClick={() => {
             setLikes(likes + 1);
             setLiked(true);
          }}
       >
          {likes} Likes
       </button>
    );
 
}
export default LikeButton;