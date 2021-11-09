import * as React from "react";
import Pagination from 'react-bootstrap/Pagination';

export const PAGE_COUNT = {
	VISIBLE_LEFT_ITEM: 5,
	VISIBLE_RIGHT_ITEM: 10,
	VISIBLE_PAGE_ITEM: 5,
}

class GridPagination extends React.Component<{}> {

	constructor() {
		super();
		this.state = {
			netxItem: 1,
			lastIcon: true,
		};
	}

	Pageitem(totalPage, currentPage, netxItem) {
		let items = [];
		let maxItem = 1
		for (let i = netxItem; i <= totalPage; i++) {
			if (maxItem <= PAGE_COUNT.VISIBLE_PAGE_ITEM) {
				items.push(<Pagination.Item key={i} active={i === currentPage ? true : false} disabled={i === currentPage ? true : false} onClick={e => this.handleChangePage(e, "selectPage", i)}>
					{i}
				</Pagination.Item>)
				maxItem++
			}
		}
		return items
	}

	handleChangePage(event, action, clickItem) {
		const { paginationChange, currentPage, pageInfo } = this.props;
		const showLastIcon = ((pageInfo.totalPage - (this.state.netxItem + PAGE_COUNT.VISIBLE_PAGE_ITEM)) > PAGE_COUNT.VISIBLE_PAGE_ITEM) ? true : false
		switch (action) {
			case "selectPage":
				paginationChange(clickItem)
				break;
			case "next":
				if (pageInfo.totalPage > currentPage) {
					paginationChange(currentPage + 1);
					break;
				}
			case "prev":
				if (currentPage !== 1) {
					paginationChange(currentPage - 1);
					break;
				}
			case "last":
				this.setState({
					netxItem: this.state.netxItem + PAGE_COUNT.VISIBLE_PAGE_ITEM,
					lastIcon: showLastIcon
				})
				paginationChange(this.state.netxItem + PAGE_COUNT.VISIBLE_PAGE_ITEM)
				break;
			case "first":
				this.setState({
					netxItem: this.state.netxItem - PAGE_COUNT.VISIBLE_PAGE_ITEM,
					lastIcon: true
				})
				paginationChange(this.state.netxItem - PAGE_COUNT.VISIBLE_PAGE_ITEM)
				break;
		}
		event.preventDefault();
	}


	render() {
		const { Pageitem, pageInfo, currentPage, page, paginationChange } = this.props;
		const showButton = currentPage && Number.isInteger(currentPage / PAGE_COUNT.VISIBLE_PAGE_ITEM) ? true : false;
		return (<>
			<Pagination className="freshui-pageNation" size="sm">
				{this.state.netxItem > PAGE_COUNT.VISIBLE_PAGE_ITEM && <Pagination.First onClick={e => this.handleChangePage(e, "first")} />}
				<Pagination.Prev active={page > 0 ? true : false} disabled={this.state.netxItem === currentPage ? true : false} id="prev" onClick={e => this.handleChangePage(e, "prev")} />
				{currentPage > PAGE_COUNT.VISIBLE_LEFT_ITEM && <Pagination.Item disabled>{1}</Pagination.Item>}
				{currentPage > PAGE_COUNT.VISIBLE_LEFT_ITEM && <Pagination.Ellipsis />}
				{this.Pageitem(pageInfo.totalPage, currentPage, this.state.netxItem)}
				{pageInfo.totalPage > PAGE_COUNT.VISIBLE_RIGHT_ITEM && this.state.lastIcon && <Pagination.Ellipsis />}
				{pageInfo.totalPage > PAGE_COUNT.VISIBLE_RIGHT_ITEM && this.state.lastIcon && <Pagination.Item disabled>{pageInfo.totalPage}</Pagination.Item>}
				<Pagination.Next active={pageInfo.totalPage > 0 && pageInfo.totalPage != currentPage  ? true : false} disabled={showButton ? true : pageInfo.totalPage > page + 1 ? false : true} id="next" onClick={e => this.handleChangePage(e, "next")} />
				{pageInfo.totalPage > PAGE_COUNT.VISIBLE_PAGE_ITEM && this.state.lastIcon && <Pagination.Last onClick={e => this.handleChangePage(e, "last")} />}
			</Pagination>
		</>
		)
	}
}

export default GridPagination;