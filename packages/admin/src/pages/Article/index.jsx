import ImportArticleModal from '@/components/ImportArticleModal';
import NewArticleModal from '@/components/NewArticleModal';
import { getArticlesByOption } from '@/services/van-blog/api';
import { batchExport, batchDelete } from "@/services/van-blog/batch";
import { useNum } from '@/services/van-blog/useNum';
import { PageContainer, ProTable, EditableProTable } from '@ant-design/pro-components';
import { Button, Space, message } from 'antd';
import RcResizeObserver from 'rc-resize-observer';
import { useMemo, useRef, useState } from 'react';
import { history } from 'umi';
import { articleObjAll, articleObjSmall, columns } from './columns';

import React from 'react';

import { updateArticle, createArticle } from '@/services/van-blog/api';

export default () => {



  // const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const actionRef = useRef();
  const [colKeys, setColKeys] = useState(articleObjAll);
  const [simplePage, setSimplePage] = useState(false);
  const [simpleSearch, setSimpleSearch] = useState(false);
  const [pageSize, setPageSize] = useNum(20, 'article-page-size');
  const searchSpan = useMemo(() => {
    if (!simpleSearch) {
      return 8;
    } else {
      return 24;
    }
  }, [simpleSearch]);
  return (
    <PageContainer
      title={null}
      extra={null}
      ghost
      className="t-8"
      header={{ title: null, extra: null, ghost: true }}
    >
      <RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          const r = offset.width < 1000;

          setSimpleSearch(offset.width < 750);
          setSimplePage(offset.width < 600);
          if (r) {
            setColKeys(articleObjSmall);
          } else {
            setColKeys(articleObjAll);
          }
          //  小屏幕的话把默认的 col keys 删掉一些
        }}
      >
        <EditableProTable
          columns={columns}
          actionRef={actionRef}
          cardBordered

          recordCreatorProps={
            {
              position: 'top',
              record: () => ({
                id: -1 * (Math.random() * 1000000).toFixed(0),
                category: '未分类'
              }),
            }

          }

          rowSelection={{
            fixed: true,
            preserveSelectedRowKeys: true,
          }}
          tableAlertOptionRender={({ selectedRowKeys, onCleanSelected }) => {
            return <Space>
              <a onClick={async () => {
                await batchDelete(selectedRowKeys)
                message.success("批量删除成功！")
                actionRef.current.reload()
                onCleanSelected();
              }}>批量删除</a>
              <a onClick={() => {
                batchExport(selectedRowKeys)
                onCleanSelected();
              }}>批量导出</a>
              <a onClick={onCleanSelected}>取消选择</a>
            </Space>
          }}
          request={async (params = {}, sort, filter) => {
            const option = {};
            if (sort.createdAt) {
              if (sort.createdAt == 'ascend') {
                option.sortCreatedAt = 'asc';
              } else {
                option.sortCreatedAt = 'desc';
              }
            }
            if (sort.top) {
              if (sort.top == 'ascend') {
                option.sortTop = 'asc';
              } else {
                option.sortTop = 'desc';
              }
            }
            if (sort.viewer) {
              if (sort.viewer == 'ascend') {
                option.sortViewer = 'asc';
              } else {
                option.sortViewer = 'desc';
              }
            }

            // 搜索
            const { current, pageSize, ...searchObj } = params;
            if (searchObj) {
              for (const [targetName, target] of Object.entries(searchObj)) {
                switch (targetName) {
                  case 'title':
                    if (target.trim() != '') {
                      option.title = target;
                    }
                    break;
                  case 'tags':
                    if (target.trim() != '') {
                      option.tags = target;
                    }
                    break;
                  case 'endTime':
                    if (searchObj?.startTime) {
                      option.startTime = searchObj?.startTime;
                    }
                    if (searchObj?.endTime) {
                      option.endTime = searchObj?.endTime;
                    }
                    break;
                  case 'category':
                    if (target.trim() != '') {
                      option.category = target;
                    }
                    break;
                }
              }
            }
            option.page = current;
            option.pageSize = pageSize;
            const { data } = await getArticlesByOption(option);
            const { articles, total } = data;
            return {
              data: articles,
              // success 请返回 true，
              // 不然 table 会停止解析数据，即使有数据
              success: Boolean(data),
              // 不传会使用 data 的长度，如果是分页一定要传
              total: total,
            };
          }}
          editable={{
            type: 'multiple',
            // editableKeys,
            onSave: async (rowKey, data, row) => {
              console.log(rowKey, data, row);

              data.tags = Array.from(
                new Set(
                  (typeof data?.tags === "string" ? data.tags.split(",") : [])
                    .map(v => v.trim())
                    .filter(v => !!v)
                )
              );
              

              data.id = undefined
              if (rowKey > 0) {
                // 编辑
                updateArticle(rowKey, data)
              } else {
                // 新增
                const results = await createArticle(data)

                console.log(results)
                data.id = results.data.id
              }

              // data.id = rowKey

            },
            // onChange: setEditableRowKeys,
          }}
          columnsState={{
            // persistenceKey: 'van-blog-article-table',
            // persistenceType: 'localStorage',
            value: colKeys,
            onChange(value) {
              setColKeys(value);
            },
          }}
          rowKey="id"
          search={{
            labelWidth: 'auto',
            span: searchSpan,
            className: 'searchCard',
          }}
          pagination={{
            pageSize: pageSize,
            simple: simplePage,
            onChange: (p, ps) => {
              if (ps != pageSize) {
                setPageSize(ps);
              }
            },
          }}
          dateFormatter="string"
          headerTitle={simpleSearch ? undefined : '文章管理'}
          options={simpleSearch ? false : true}
          toolBarRender={() => [
            // <Button
            //   key="editAboutMe"
            //   onClick={() => {
            //     history.push(`/editor?type=about&id=${0}`);
            //   }}
            // >
            //   {`编辑关于`}
            // </Button>,


            <Button
              key="backBtn"
              type="primary"
              onClick={() => {

                window.open('/admin/new-or-edit?type=article', '_blank');

              }}
            >
              新建
            </Button>,

            // <ImportArticleModal
            //   key="importArticleBtn"
            //   onFinish={() => {
            //     actionRef?.current?.reload();
            //     message.success('导入成功！');
            //   }}
            // />,
          ]}
        />
      </RcResizeObserver>
    </PageContainer>
  );
};
