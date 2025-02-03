import { FilterList, KeyboardArrowDown, KeyboardArrowRight } from '@material-ui/icons';
import { Button, IconButton, Tooltip } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useTable, useExpanded, useFilters, useGlobalFilter, usePagination } from 'react-table';
import './ReactTable.scss'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CustomTooltip from '../CustomTooltip/CustomTooltip';

export const ReactTable = ({ columns, data, expandable, title, tablePageCount, setPageCount, isCustomPageCount, classname=""}) => {
    const [showColumnFilters, setShowColumnFilters] = useState(false);
    const defaultColumn = useMemo(
        () => ({
            Filter: DefaultColumnFilter,
        }),
        []
    );

    const plugins = [useFilters, useGlobalFilter];
    if (expandable) {
        plugins.push(useExpanded);
    }
    plugins.push(usePagination); // Ensure usePagination is always included

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        state: { expanded, globalFilter, pageIndex, pageSize },
        setGlobalFilter,
        setAllFilters,
        gotoPage,
        nextPage,
        previousPage,
        pageOptions,
        canPreviousPage,
        canNextPage,
        pageCount,
        setPageSize,
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: isCustomPageCount ? tablePageCount : 0 },
            // getSubRows: (row) => row.subRows,
            defaultColumn,
        },
        ...plugins // Spread the plugins array
    );

    const toggleColumnFilters = () => {
        setShowColumnFilters(!showColumnFilters);
        setAllFilters([]);
    };
    var innertableJSX = '';

    useEffect(() => {
        if (isCustomPageCount) {
            setPageCount(pageIndex)
        }
    }, [pageIndex])

    return (
        <div className={`${classname}`}>
            <div className={`react-table-wrapper`}>
                <div className='react-table-header'>
                    <div className='react-table-title'>
                        <h4>{title ? title : ''}</h4>
                    </div>
                    {data && data.length > 0 ?
                        <div className='react-table-filters'>
                            {/* Global Filter */}
                            <div>
                                <input
                                    value={globalFilter || ''}
                                    onChange={e => setGlobalFilter(e.target.value)}
                                    placeholder="Search..."
                                />
                            </div>
                            <div>
                                <IconButton onClick={toggleColumnFilters}>
                                    <CustomTooltip title='Filter' placement='bottom'>
                                        <FilterList className={`${showColumnFilters ? 'filter-enabled' : ''}`} />
                                    </CustomTooltip>
                                </IconButton>
                            </div>
                        </div>
                        : null}
                </div>
                <div className='table-scroller'>
                    <table {...getTableProps()} className={`${expandable ? 'expanded-table':''} default-table`}>
                        {data && data.length > 0 ?
                            <>
                                <thead>
                                    {headerGroups.map(headerGroup => (
                                        <>
                                            <tr {...headerGroup.getHeaderGroupProps()}>
                                                {expandable && (<th><span></span></th>)}
                                                {headerGroup.headers.map(column => (
                                                    <th {...column.getHeaderProps()} className={column.className}>
                                                        {column.render('Header')}
                                                        {/* Render the column filter UI */}
                                                        {/* {showColumnFilters && <div>{column.canFilter ? column.render('Filter') : null}</div>} */}
                                                    </th>
                                                ))}
                                            </tr>
                                            {showColumnFilters && <tr {...headerGroup.getHeaderGroupProps()}>
                                                {expandable && (<th><span></span></th>)}
                                                {headerGroup.headers.map(column => (
                                                    <th {...column.getHeaderProps()} className={`${column.className} active-filters-row`}>
                                                        {/* Render the column filter UI */}
                                                        {/* {showColumnFilters && <div>{column.canFilter ? column.render('Filter') : null}</div>} */}
                                                        <div>{column.canFilter ? column.render('Filter') : null}</div>
                                                    </th>
                                                ))}
                                            </tr>}
                                        </>
                                    ))}
                                </thead>
                                <tbody {...getTableBodyProps()}>
                                    {page && page.length > 0 ? page.map(row => {
                                        prepareRow(row);
                                        innertableJSX = row.isExpanded ?
                                            row.original.innerJSX
                                            : null
                                        return (
                                            <React.Fragment key={row.id}>

                                                {row.isExpanded ? (<>
                                                    <tr className="Expanded" {...row.getRowProps()}>
                                                        {expandable && (<td>
                                                            <span
                                                                onClick={() => row.toggleRowExpanded()}
                                                                style={{ cursor: 'pointer', fontSize: '14px' }}
                                                            >
                                                                {row.isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                                                            </span>
                                                        </td>)}
                                                        {row.cells.map(cell => {
                                                            return <td  {...cell.getCellProps({
                                                                className: cell.column.className
                                                            })}>{cell.render('Cell')}</td>
                                                        })}
                                                    </tr>
                                                            {innertableJSX}
                                                        </>
                                                ) :
                                                    // row.original.isOpen ? <React.Fragment><><tr className={'normal'} {...row.getRowProps()}>
                                                    //     {row.cells.map(cell => {
                                                    //         return <td  {...cell.getCellProps({
                                                    //             className: cell.column.className
                                                    //         })}>{cell.render('Cell')}</td>
                                                    //     })}
                                                    // </tr>
                                                           
                                                    //     </>
                                                        
                                                    // </React.Fragment> : 
                                                    <>
                                                        <tr className={row.depth ? 'subrows' : 'normal'} {...row.getRowProps()}>

                                                            {expandable && (<td>
                                                                <span
                                                                    onClick={() => row.toggleRowExpanded()}
                                                                    style={{ cursor: 'pointer', fontSize: '14px',}}
                                                                    className={row.original.innerJSX ? 'showArrow' : 'hideArrow'}
                                                                    
                                                                >
                                                                    {row.isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                                                                </span>
                                                            </td>)}
                                                            {row.cells.map(cell => {
                                                                return <td  {...cell.getCellProps({
                                                                    className: cell.column.className
                                                                })}>{cell.render('Cell')}</td>
                                                            })}
                                                        </tr></>}
                                            </React.Fragment>
                                        );
                                    }) : <tr>
                                        <td colSpan={expandable ? columns.length + 1 : columns.length} className='table-data-not-found'>
                                            No Data Available.
                                        </td>
                                    </tr>}
                                </tbody>
                            </>
                            : <tbody>
                                <tr>
                                    <td colSpan={columns.length} className='table-data-not-found'>
                                        No Data Available.
                                    </td>
                                </tr>
                            </tbody>
                        }
                    </table>
                </div>

            </div>
            {/* Pagination */}
            {data && data.length > 0 ?
                <div className='react-table-pagination'>
                    <div className='table-pagination-content'>
                        <button className='pagination-prev' onClick={previousPage} disabled={!canPreviousPage}>
                            <ArrowBackIosIcon />
                        </button>{' '}
                        <span className='current-page-count'>{pageIndex + 1}</span>
                        <button className='pagination-next' onClick={nextPage} disabled={!canNextPage}>
                            <ArrowForwardIosIcon />
                        </button>{' '}
                    </div>

                    {/* <span>
                    Page{' '}
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
                    </strong>{' '}
                </span> */}
                    {/* <span>
                    | Go to page:{' '}
                    <input
                        type="number"
                        defaultValue={pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                            gotoPage(page);
                        }}
                        style={{ width: '50px' }}
                    />
                </span>{' '} */}
                    {/* <select
                    value={pageSize}
                    onChange={e => {
                        setPageSize(Number(e.target.value));
                    }}
                >
                    {[5, 10, 20].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select> */}


                    {/* <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    {'<<'}
                </button>{' '} */}
                    {/* <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    {'>>'}
                </button>{' '} */}
                </div>
                : null}
        </div>
    );
};

// Default filter UI
const DefaultColumnFilter = ({ column: { filterValue, setFilter } }) => {
    return (
        <input
            value={filterValue || ''}
            onChange={e => setFilter(e.target.value || undefined)}
            placeholder={`Filter...`}
        />
    );
};
