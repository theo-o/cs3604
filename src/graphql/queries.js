/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const searchObjects = /* GraphQL */ `
  query SearchObjects(
    $allFields: String
    $sort: SearchableObjectSortInput
    $filter: SearchableObjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    searchObjects(
      allFields: $allFields
      sort: $sort
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        belongs_to
        bibliographic_citation
        circa
        create_date
        creator
        custom_key
        description
        display_date
        end_date
        heirarchy_path
        id
        identifier
        language
        location
        modified_date
        parent_collection
        provenance
        related_url
        rights_holder
        rights_statement
        source
        start_date
        subject
        thumbnail_path
        title
        visibility
        ... on Collection {
          collection_category
          collectionmap_id
          collectionOptions
          explicit_content
          ownerinfo
          createdAt
          updatedAt
          collectionmap {
            collectionmap_category
            collection_id
            create_date
            id
            map_object
            modified_date
            createdAt
            updatedAt
          }
          archives {
            nextToken
          }
        }
        ... on Archive {
          archiveOptions
          contributor
          explicit
          extent
          format
          item_category
          manifest_file_characterization
          manifest_url
          medium
          reference
          repository
          resource_type
          tags
          createdAt
          updatedAt
          collection {
            belongs_to
            bibliographic_citation
            circa
            collection_category
            collectionmap_id
            collectionOptions
            create_date
            creator
            custom_key
            description
            display_date
            end_date
            explicit_content
            heirarchy_path
            id
            identifier
            language
            location
            modified_date
            ownerinfo
            parent_collection
            provenance
            related_url
            rights_holder
            rights_statement
            source
            start_date
            subject
            thumbnail_path
            title
            visibility
            createdAt
            updatedAt
          }
        }
      }
      nextToken
      total
    }
  }
`;
export const fulltextCollections = /* GraphQL */ `
  query FulltextCollections(
    $allFields: String
    $filter: SearchableCollectionFilterInput
    $sort: SearchableCollectionSortInput
    $limit: Int
    $nextToken: String
  ) {
    fulltextCollections(
      allFields: $allFields
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        belongs_to
        bibliographic_citation
        circa
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
        end_date
        explicit_content
        heirarchy_path
        id
        identifier
        language
        location
        modified_date
        ownerinfo
        parent_collection
        provenance
        related_url
        rights_holder
        rights_statement
        source
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collectionmap {
          collectionmap_category
          collection_id
          create_date
          id
          map_object
          modified_date
          createdAt
          updatedAt
        }
        archives {
          nextToken
        }
      }
      nextToken
      total
    }
  }
`;
export const fulltextArchives = /* GraphQL */ `
  query FulltextArchives(
    $allFields: String
    $filter: SearchableArchiveFilterInput
    $sort: SearchableArchiveSortInput
    $limit: Int
    $nextToken: String
  ) {
    fulltextArchives(
      allFields: $allFields
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        archiveOptions
        belongs_to
        bibliographic_citation
        circa
        contributor
        create_date
        creator
        custom_key
        description
        display_date
        end_date
        explicit
        extent
        format
        heirarchy_path
        id
        identifier
        item_category
        language
        location
        manifest_file_characterization
        manifest_url
        medium
        modified_date
        parent_collection
        provenance
        reference
        related_url
        repository
        resource_type
        rights_holder
        rights_statement
        source
        start_date
        subject
        tags
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collection {
          belongs_to
          bibliographic_citation
          circa
          collection_category
          collectionmap_id
          collectionOptions
          create_date
          creator
          custom_key
          description
          display_date
          end_date
          explicit_content
          heirarchy_path
          id
          identifier
          language
          location
          modified_date
          ownerinfo
          parent_collection
          provenance
          related_url
          rights_holder
          rights_statement
          source
          start_date
          subject
          thumbnail_path
          title
          visibility
          createdAt
          updatedAt
        }
      }
      nextToken
      total
    }
  }
`;
export const getCollection = /* GraphQL */ `
  query GetCollection($id: ID!) {
    getCollection(id: $id) {
      belongs_to
      bibliographic_citation
      circa
      collection_category
      collectionmap_id
      collectionOptions
      create_date
      creator
      custom_key
      description
      display_date
      end_date
      explicit_content
      heirarchy_path
      id
      identifier
      language
      location
      modified_date
      ownerinfo
      parent_collection
      provenance
      related_url
      rights_holder
      rights_statement
      source
      start_date
      subject
      thumbnail_path
      title
      visibility
      createdAt
      updatedAt
      collectionmap {
        collectionmap_category
        collection_id
        create_date
        id
        map_object
        modified_date
        createdAt
        updatedAt
        collection {
          belongs_to
          bibliographic_citation
          circa
          collection_category
          collectionmap_id
          collectionOptions
          create_date
          creator
          custom_key
          description
          display_date
          end_date
          explicit_content
          heirarchy_path
          id
          identifier
          language
          location
          modified_date
          ownerinfo
          parent_collection
          provenance
          related_url
          rights_holder
          rights_statement
          source
          start_date
          subject
          thumbnail_path
          title
          visibility
          createdAt
          updatedAt
        }
      }
      archives {
        items {
          archiveOptions
          belongs_to
          bibliographic_citation
          circa
          contributor
          create_date
          creator
          custom_key
          description
          display_date
          end_date
          explicit
          extent
          format
          heirarchy_path
          id
          identifier
          item_category
          language
          location
          manifest_file_characterization
          manifest_url
          medium
          modified_date
          parent_collection
          provenance
          reference
          related_url
          repository
          resource_type
          rights_holder
          rights_statement
          source
          start_date
          subject
          tags
          thumbnail_path
          title
          visibility
          createdAt
          updatedAt
        }
        nextToken
      }
    }
  }
`;
export const listCollections = /* GraphQL */ `
  query ListCollections(
    $filter: ModelCollectionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCollections(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        belongs_to
        bibliographic_citation
        circa
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
        end_date
        explicit_content
        heirarchy_path
        id
        identifier
        language
        location
        modified_date
        ownerinfo
        parent_collection
        provenance
        related_url
        rights_holder
        rights_statement
        source
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collectionmap {
          collectionmap_category
          collection_id
          create_date
          id
          map_object
          modified_date
          createdAt
          updatedAt
        }
        archives {
          nextToken
        }
      }
      nextToken
    }
  }
`;
export const collectionByIdentifier = /* GraphQL */ `
  query CollectionByIdentifier(
    $identifier: String
    $sortDirection: ModelSortDirection
    $filter: ModelCollectionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    collectionByIdentifier(
      identifier: $identifier
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        belongs_to
        bibliographic_citation
        circa
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
        end_date
        explicit_content
        heirarchy_path
        id
        identifier
        language
        location
        modified_date
        ownerinfo
        parent_collection
        provenance
        related_url
        rights_holder
        rights_statement
        source
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collectionmap {
          collectionmap_category
          collection_id
          create_date
          id
          map_object
          modified_date
          createdAt
          updatedAt
        }
        archives {
          nextToken
        }
      }
      nextToken
    }
  }
`;
export const searchCollections = /* GraphQL */ `
  query SearchCollections(
    $filter: SearchableCollectionFilterInput
    $sort: SearchableCollectionSortInput
    $limit: Int
    $nextToken: String
    $from: Int
  ) {
    searchCollections(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
    ) {
      items {
        belongs_to
        bibliographic_citation
        circa
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
        end_date
        explicit_content
        heirarchy_path
        id
        identifier
        language
        location
        modified_date
        ownerinfo
        parent_collection
        provenance
        related_url
        rights_holder
        rights_statement
        source
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collectionmap {
          collectionmap_category
          collection_id
          create_date
          id
          map_object
          modified_date
          createdAt
          updatedAt
        }
        archives {
          nextToken
        }
      }
      nextToken
      total
    }
  }
`;
export const getCollectionmap = /* GraphQL */ `
  query GetCollectionmap($id: ID!) {
    getCollectionmap(id: $id) {
      collectionmap_category
      collection_id
      create_date
      id
      map_object
      modified_date
      createdAt
      updatedAt
      collection {
        belongs_to
        bibliographic_citation
        circa
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
        end_date
        explicit_content
        heirarchy_path
        id
        identifier
        language
        location
        modified_date
        ownerinfo
        parent_collection
        provenance
        related_url
        rights_holder
        rights_statement
        source
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collectionmap {
          collectionmap_category
          collection_id
          create_date
          id
          map_object
          modified_date
          createdAt
          updatedAt
        }
        archives {
          nextToken
        }
      }
    }
  }
`;
export const listCollectionmaps = /* GraphQL */ `
  query ListCollectionmaps(
    $filter: ModelCollectionmapFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCollectionmaps(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        collectionmap_category
        collection_id
        create_date
        id
        map_object
        modified_date
        createdAt
        updatedAt
        collection {
          belongs_to
          bibliographic_citation
          circa
          collection_category
          collectionmap_id
          collectionOptions
          create_date
          creator
          custom_key
          description
          display_date
          end_date
          explicit_content
          heirarchy_path
          id
          identifier
          language
          location
          modified_date
          ownerinfo
          parent_collection
          provenance
          related_url
          rights_holder
          rights_statement
          source
          start_date
          subject
          thumbnail_path
          title
          visibility
          createdAt
          updatedAt
        }
      }
      nextToken
    }
  }
`;
export const getArchive = /* GraphQL */ `
  query GetArchive($id: ID!) {
    getArchive(id: $id) {
      archiveOptions
      belongs_to
      bibliographic_citation
      circa
      contributor
      create_date
      creator
      custom_key
      description
      display_date
      end_date
      explicit
      extent
      format
      heirarchy_path
      id
      identifier
      item_category
      language
      location
      manifest_file_characterization
      manifest_url
      medium
      modified_date
      parent_collection
      provenance
      reference
      related_url
      repository
      resource_type
      rights_holder
      rights_statement
      source
      start_date
      subject
      tags
      thumbnail_path
      title
      visibility
      createdAt
      updatedAt
      collection {
        belongs_to
        bibliographic_citation
        circa
        collection_category
        collectionmap_id
        collectionOptions
        create_date
        creator
        custom_key
        description
        display_date
        end_date
        explicit_content
        heirarchy_path
        id
        identifier
        language
        location
        modified_date
        ownerinfo
        parent_collection
        provenance
        related_url
        rights_holder
        rights_statement
        source
        start_date
        subject
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collectionmap {
          collectionmap_category
          collection_id
          create_date
          id
          map_object
          modified_date
          createdAt
          updatedAt
        }
        archives {
          nextToken
        }
      }
    }
  }
`;
export const listArchives = /* GraphQL */ `
  query ListArchives(
    $filter: ModelArchiveFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listArchives(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        archiveOptions
        belongs_to
        bibliographic_citation
        circa
        contributor
        create_date
        creator
        custom_key
        description
        display_date
        end_date
        explicit
        extent
        format
        heirarchy_path
        id
        identifier
        item_category
        language
        location
        manifest_file_characterization
        manifest_url
        medium
        modified_date
        parent_collection
        provenance
        reference
        related_url
        repository
        resource_type
        rights_holder
        rights_statement
        source
        start_date
        subject
        tags
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collection {
          belongs_to
          bibliographic_citation
          circa
          collection_category
          collectionmap_id
          collectionOptions
          create_date
          creator
          custom_key
          description
          display_date
          end_date
          explicit_content
          heirarchy_path
          id
          identifier
          language
          location
          modified_date
          ownerinfo
          parent_collection
          provenance
          related_url
          rights_holder
          rights_statement
          source
          start_date
          subject
          thumbnail_path
          title
          visibility
          createdAt
          updatedAt
        }
      }
      nextToken
    }
  }
`;
export const archiveByIdentifier = /* GraphQL */ `
  query ArchiveByIdentifier(
    $identifier: String
    $sortDirection: ModelSortDirection
    $filter: ModelArchiveFilterInput
    $limit: Int
    $nextToken: String
  ) {
    archiveByIdentifier(
      identifier: $identifier
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        archiveOptions
        belongs_to
        bibliographic_citation
        circa
        contributor
        create_date
        creator
        custom_key
        description
        display_date
        end_date
        explicit
        extent
        format
        heirarchy_path
        id
        identifier
        item_category
        language
        location
        manifest_file_characterization
        manifest_url
        medium
        modified_date
        parent_collection
        provenance
        reference
        related_url
        repository
        resource_type
        rights_holder
        rights_statement
        source
        start_date
        subject
        tags
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collection {
          belongs_to
          bibliographic_citation
          circa
          collection_category
          collectionmap_id
          collectionOptions
          create_date
          creator
          custom_key
          description
          display_date
          end_date
          explicit_content
          heirarchy_path
          id
          identifier
          language
          location
          modified_date
          ownerinfo
          parent_collection
          provenance
          related_url
          rights_holder
          rights_statement
          source
          start_date
          subject
          thumbnail_path
          title
          visibility
          createdAt
          updatedAt
        }
      }
      nextToken
    }
  }
`;
export const searchArchives = /* GraphQL */ `
  query SearchArchives(
    $filter: SearchableArchiveFilterInput
    $sort: SearchableArchiveSortInput
    $limit: Int
    $nextToken: String
    $from: Int
  ) {
    searchArchives(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
    ) {
      items {
        archiveOptions
        belongs_to
        bibliographic_citation
        circa
        contributor
        create_date
        creator
        custom_key
        description
        display_date
        end_date
        explicit
        extent
        format
        heirarchy_path
        id
        identifier
        item_category
        language
        location
        manifest_file_characterization
        manifest_url
        medium
        modified_date
        parent_collection
        provenance
        reference
        related_url
        repository
        resource_type
        rights_holder
        rights_statement
        source
        start_date
        subject
        tags
        thumbnail_path
        title
        visibility
        createdAt
        updatedAt
        collection {
          belongs_to
          bibliographic_citation
          circa
          collection_category
          collectionmap_id
          collectionOptions
          create_date
          creator
          custom_key
          description
          display_date
          end_date
          explicit_content
          heirarchy_path
          id
          identifier
          language
          location
          modified_date
          ownerinfo
          parent_collection
          provenance
          related_url
          rights_holder
          rights_statement
          source
          start_date
          subject
          thumbnail_path
          title
          visibility
          createdAt
          updatedAt
        }
      }
      nextToken
      total
    }
  }
`;
export const getEmbargo = /* GraphQL */ `
  query GetEmbargo($id: ID!) {
    getEmbargo(id: $id) {
      id
      identifier
      start_date
      end_date
      note
      record_type
      createdAt
      updatedAt
    }
  }
`;
export const listEmbargos = /* GraphQL */ `
  query ListEmbargos(
    $filter: ModelEmbargoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEmbargos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        identifier
        start_date
        end_date
        note
        record_type
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getSite = /* GraphQL */ `
  query GetSite($id: ID!) {
    getSite(id: $id) {
      analyticsID
      assetBasePath
      browseCollections
      contact
      displayedAttributes
      groups
      homePage
      id
      lang
      miradorOptions
      searchPage
      siteColor
      siteId
      siteName
      siteOptions
      sitePages
      siteTitle
      createdAt
      updatedAt
    }
  }
`;
export const listSites = /* GraphQL */ `
  query ListSites(
    $filter: ModelSiteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSites(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        analyticsID
        assetBasePath
        browseCollections
        contact
        displayedAttributes
        groups
        homePage
        id
        lang
        miradorOptions
        searchPage
        siteColor
        siteId
        siteName
        siteOptions
        sitePages
        siteTitle
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const siteBySiteId = /* GraphQL */ `
  query SiteBySiteId(
    $siteId: String
    $sortDirection: ModelSortDirection
    $filter: ModelSiteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    siteBySiteId(
      siteId: $siteId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        analyticsID
        assetBasePath
        browseCollections
        contact
        displayedAttributes
        groups
        homePage
        id
        lang
        miradorOptions
        searchPage
        siteColor
        siteId
        siteName
        siteOptions
        sitePages
        siteTitle
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getHistory = /* GraphQL */ `
  query GetHistory($id: ID!) {
    getHistory(id: $id) {
      event
      groups
      id
      siteID
      userEmail
      createdAt
      updatedAt
    }
  }
`;
export const listHistorys = /* GraphQL */ `
  query ListHistorys(
    $filter: ModelHistoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listHistorys(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        event
        groups
        id
        siteID
        userEmail
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
