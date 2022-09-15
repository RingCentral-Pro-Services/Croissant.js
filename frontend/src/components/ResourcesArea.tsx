import React from 'react';
// @ts-ignore
import linkIcon from '../link.png'

const ResourcesArea = (props: any) => {
    const { title, links } = props

    return ( 
        <div className="resources">
            <strong>{ title }</strong>
            {links.map((link: any) => (
                <div className='resource-items' key={link.id}>
                    <a href={ link.link } target="_blank" rel="noreferrer" className='info-link'>{ link.text }</a>
                    <img src={ linkIcon } alt="link icon" className='link-icon' />
                    <br />
                </div>
            ))}
        </div>
     );
}
 
export default ResourcesArea;