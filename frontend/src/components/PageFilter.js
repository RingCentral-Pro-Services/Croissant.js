import FilterItem from "./FilterItem";

const PageFilter = (props) => {
    const { pages, handleFilterClick, handleInput, selectAll } = props

    const handleClick = () => {
        const box = document.getElementById("filter-box")
        if (box.className.indexOf("w3-show") === -1) {
            box.className += " w3-show";
        } else {
            box.className = box.className.replace(" w3-show", "");
        }
    }

    return ( 
        <div className="dropdown-click">
            <button type="button" id="filter-button" onClick={handleClick}>Filter Site(s)</button>
            <div className="dropdown-content" id="filter-box">
                <input className="w3-input w3-padding" type="search" placeholder="Search.." id="myInput"  onInput={handleInput} autoComplete="off" />
                <FilterItem text="Select All" isChecked={selectAll} handleClick={handleFilterClick}/>
                {pages.map((page) => (
                    <FilterItem text={ page.text } isChecked={ page.checked } handleClick={ handleFilterClick } key={page.text} />
                ))}
            </div>
        </div>
     );
}
 
export default PageFilter;